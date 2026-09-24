import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.model.js";
import { Product } from "../models/Product.model.js";
import * as userController from "./user.controller.js";

const userId = "507f1f77bcf86cd799439011";
const productId = "507f1f77bcf86cd799439012";

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("new users start with an empty wishlist", () => {
  const user = new User({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "hashed-password",
  });

  assert.deepEqual(user.wishlist, []);
});

test("getWishlist returns the signed-in user's populated products", async () => {
  const originalFindById = User.findById;
  const product = { _id: productId, name: "Test jersey", price: 100 };
  User.findById = (id) => {
    assert.equal(id, userId);
    return {
      populate: async (field) => {
        assert.equal(field, "wishlist");
        return { wishlist: [product] };
      },
    };
  };

  try {
    const res = response();
    await userController.getWishlist({ user: { userId } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, wishlist: [product] });
  } finally {
    User.findById = originalFindById;
  }
});

test("addToWishlist keeps one product after repeated requests", async () => {
  const originalExists = Product.exists;
  const originalUpdate = User.findByIdAndUpdate;
  const savedIds = new Set();
  const product = { _id: productId, name: "Test jersey", price: 100 };
  Product.exists = async (filter) => {
    assert.deepEqual(filter, { _id: productId });
    return { _id: productId };
  };
  User.findByIdAndUpdate = (id, update, options) => {
    assert.equal(id, userId);
    assert.deepEqual(update, { $addToSet: { wishlist: productId } });
    assert.deepEqual(options, { new: true });
    savedIds.add(update.$addToSet.wishlist);
    return {
      populate: async (field) => {
        assert.equal(field, "wishlist");
        return { wishlist: [...savedIds].map(() => product) };
      },
    };
  };

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = response();
      await userController.addToWishlist(
        { user: { userId }, params: { productId } },
        res,
      );
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body.wishlist, [product]);
    }
  } finally {
    Product.exists = originalExists;
    User.findByIdAndUpdate = originalUpdate;
  }
});

test("addToWishlist rejects a malformed product ID", async () => {
  const res = response();
  await userController.addToWishlist(
    { user: { userId }, params: { productId: "invalid" } },
    res,
  );
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("addToWishlist rejects a product that does not exist", async () => {
  const originalExists = Product.exists;
  Product.exists = async () => null;
  try {
    const res = response();
    await userController.addToWishlist(
      { user: { userId }, params: { productId } },
      res,
    );
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  } finally {
    Product.exists = originalExists;
  }
});

test("removeFromWishlist removes only the requested product", async () => {
  const originalUpdate = User.findByIdAndUpdate;
  const otherId = "507f1f77bcf86cd799439013";
  const savedIds = [productId, otherId];
  User.findByIdAndUpdate = (id, update, options) => {
    assert.equal(id, userId);
    assert.deepEqual(update, { $pull: { wishlist: productId } });
    assert.deepEqual(options, { new: true });
    savedIds.splice(savedIds.indexOf(update.$pull.wishlist), 1);
    return {
      populate: async (field) => {
        assert.equal(field, "wishlist");
        return { wishlist: savedIds.map((_id) => ({ _id })) };
      },
    };
  };

  try {
    const res = response();
    await userController.removeFromWishlist(
      { user: { userId }, params: { productId } },
      res,
    );
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.wishlist, [{ _id: otherId }]);
  } finally {
    User.findByIdAndUpdate = originalUpdate;
  }
});

test("removeFromWishlist rejects a malformed product ID", async () => {
  const res = response();
  await userController.removeFromWishlist(
    { user: { userId }, params: { productId: "invalid" } },
    res,
  );
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});
