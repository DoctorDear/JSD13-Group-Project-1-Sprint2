import test from "node:test";
import assert from "node:assert/strict";
import { Review } from "../models/Review.model.js";
import { Product } from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import * as reviewController from "./review.controller.js";

test("my reviews queries only the signed-in user's reviews and includes product details", async () => {
  assert.equal(typeof reviewController.getMyReviews, "function");
  const originalFind = Review.find;
  let filter;
  let selectedProduct;
  let order;
  Review.find = (value) => {
    filter = value;
    return {
      populate(path, fields) {
        selectedProduct = { path, fields };
        return this;
      },
      sort(value) {
        order = value;
        return this;
      },
      lean: async () => [{
        _id: "review-1", productId: { _id: "product-1", name: "Home Jersey", images: ["/jersey.png"] },
        orderId: "order-1", rating: 5,
        detailedRatings: { comfort: 5, quality: 4, fit: 3, length: 3 },
        isRecommended: true,
        title: "Great", body: "Comfortable", status: "published",
        createdAt: new Date("2026-09-20T00:00:00Z"),
      }],
    };
  };

  let response;
  try {
    await reviewController.getMyReviews(
      { user: { userId: "user-1" } },
      { status() { return this; }, json(value) { response = value; return this; } },
      (error) => { throw error; },
    );
  } finally {
    Review.find = originalFind;
  }

  assert.deepEqual(filter, { userId: "user-1" });
  assert.deepEqual(selectedProduct, { path: "productId", fields: "name images" });
  assert.deepEqual(order, { createdAt: -1 });
  assert.equal(response.reviews[0].product.name, "Home Jersey");
  assert.equal(response.reviews[0].rating, 5);
  assert.deepEqual(response.reviews[0].detailedRatings, { comfort: 5, quality: 4, fit: 3, length: 3 });
  assert.equal(response.reviews[0].isRecommended, true);
  assert.equal(response.reviews[0].orderId, "order-1");
});

test("review creation checks for a completed purchase", async () => {
  const originalProductExists = Product.exists;
  const originalReviewExists = Review.exists;
  const originalOrderFindOne = Order.findOne;
  let orderFilter;
  Product.exists = async () => true;
  Review.exists = async () => false;
  Order.findOne = (filter) => {
    orderFilter = filter;
    return { sort: async () => null };
  };
  let status;
  try {
    await reviewController.createProductReview(
      {
        params: { productId: "507f1f77bcf86cd799439011" },
        user: { userId: "507f1f77bcf86cd799439012" },
        body: { rating: 5, body: "Great fit" },
      },
      { status(value) { status = value; return this; }, json() { return this; } },
      (error) => { throw error; },
    );
  } finally {
    Product.exists = originalProductExists;
    Review.exists = originalReviewExists;
    Order.findOne = originalOrderFindOne;
  }
  assert.equal(status, 403);
  assert.equal(orderFilter.orderStatus, "completed");
});

test("review eligibility requires a completed purchase and no existing review", async () => {
  assert.equal(typeof reviewController.getReviewEligibility, "function");
  const productId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439012";
  const originalProductExists = Product.exists;
  const originalReviewExists = Review.exists;
  const originalOrderExists = Order.exists;
  let hasReview = false;
  let hasCompletedOrder = true;
  let productFilter;
  let reviewFilter;
  let orderFilter;
  Product.exists = async (filter) => { productFilter = filter; return true; };
  Review.exists = async (filter) => { reviewFilter = filter; return hasReview; };
  Order.exists = async (filter) => { orderFilter = filter; return hasCompletedOrder; };

  const check = async () => {
    let response;
    let status;
    await reviewController.getReviewEligibility(
      { params: { productId }, user: { userId } },
      { status(value) { status = value; return this; }, json(value) { response = value; return this; } },
      (error) => { throw error; },
    );
    assert.equal(status, 200);
    return response;
  };

  try {
    assert.deepEqual(await check(), { canReview: true, hasReviewed: false });
    assert.deepEqual(productFilter, { _id: productId, isActive: true });
    assert.deepEqual(reviewFilter, { productId, userId });
    assert.deepEqual(orderFilter, { userId, orderStatus: "completed", "items.productId": productId });

    hasReview = true;
    assert.deepEqual(await check(), { canReview: false, hasReviewed: true });

    hasReview = false;
    hasCompletedOrder = false;
    assert.deepEqual(await check(), { canReview: false, hasReviewed: false });
  } finally {
    Product.exists = originalProductExists;
    Review.exists = originalReviewExists;
    Order.exists = originalOrderExists;
  }
});

test("a user can load only their own product review for editing", async () => {
  const productId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439012";
  const originalFindOne = Review.findOne;
  let filter;
  let population;
  Review.findOne = (value) => {
    filter = value;
    return { populate: async (path, fields) => {
      population = { path, fields };
      return {
        _id: "review-1", userId: { firstName: "Alex", lastName: "Lee" },
        rating: 4, detailedRatings: { fit: 3 }, title: "Good", body: "Good fit",
        tags: [], isRecommended: true, verifiedPurchase: true,
        createdAt: new Date("2026-09-20T00:00:00Z"),
      };
    } };
  };
  let status;
  let response;
  try {
    await reviewController.getMyProductReview(
      { params: { productId }, user: { userId } },
      { status(value) { status = value; return this; }, json(value) { response = value; return this; } },
      (error) => { throw error; },
    );
  } finally {
    Review.findOne = originalFindOne;
  }
  assert.equal(status, 200);
  assert.deepEqual(filter, { productId, userId });
  assert.deepEqual(population, { path: "userId", fields: "firstName lastName" });
  assert.equal(response.review.body, "Good fit");
  assert.equal(response.review.rating, 4);
  assert.equal(response.review.reviewer.name, "Alex Lee");
  assert.equal(response.review.verifiedPurchase, true);
  assert.equal(response.review.createdAt.toISOString(), "2026-09-20T00:00:00.000Z");
});

test("editing a review changes only its content and requires ownership", async () => {
  const productId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439012";
  const originalUpdate = Review.findOneAndUpdate;
  let filter;
  let update;
  let options;
  Review.findOneAndUpdate = (nextFilter, nextUpdate, nextOptions) => {
    filter = nextFilter;
    update = nextUpdate;
    options = nextOptions;
    return { populate: async () => ({
      _id: "review-1", userId: { firstName: "Alex" }, rating: 5,
      detailedRatings: { comfort: 5, quality: 4, fit: 3, length: 3 },
      title: "Updated", body: "Now even better", isRecommended: false,
    }) };
  };
  let status;
  try {
    await reviewController.updateMyProductReview(
      { params: { productId }, user: { userId }, body: {
        rating: 5, detailedRatings: { comfort: 5, quality: 4, fit: 3, length: 3 },
        title: "Updated", body: "Now even better", isRecommended: false,
        productId: "other-product", userId: "other-user", verifiedPurchase: false,
      } },
      { status(value) { status = value; return this; }, json() { return this; } },
      (error) => { throw error; },
    );
  } finally {
    Review.findOneAndUpdate = originalUpdate;
  }
  assert.equal(status, 200);
  assert.deepEqual(filter, { productId, userId });
  assert.deepEqual(update, { $set: {
    rating: 5, detailedRatings: { comfort: 5, quality: 4, fit: 3, length: 3 },
    title: "Updated", body: "Now even better", isRecommended: false,
  } });
  assert.deepEqual(options, { new: true, runValidators: true });
});

test("editing someone else's review returns not found", async () => {
  const originalUpdate = Review.findOneAndUpdate;
  Review.findOneAndUpdate = () => ({ populate: async () => null });
  let status;
  try {
    await reviewController.updateMyProductReview(
      { params: { productId: "507f1f77bcf86cd799439011" }, user: { userId: "507f1f77bcf86cd799439012" }, body: { rating: 5, body: "Changed" } },
      { status(value) { status = value; return this; }, json() { return this; } },
      (error) => { throw error; },
    );
  } finally {
    Review.findOneAndUpdate = originalUpdate;
  }
  assert.equal(status, 404);
});

test("editing without a request body returns a validation error", async () => {
  let status;
  await reviewController.updateMyProductReview(
    { params: { productId: "507f1f77bcf86cd799439011" }, user: { userId: "507f1f77bcf86cd799439012" } },
    { status(value) { status = value; return this; }, json() { return this; } },
    (error) => { throw error; },
  );
  assert.equal(status, 400);
});
