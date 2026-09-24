import test from "node:test";
import assert from "node:assert/strict";
import { canReviewOrderItem } from "./reviewEligibility.js";

test("offers review only for a completed order with an available, unreviewed product", () => {
  const item = { productId: { _id: "product-1" } };
  assert.equal(canReviewOrderItem({ orderStatus: "completed" }, item, new Set()), true);
  assert.equal(canReviewOrderItem({ orderStatus: "pending" }, item, new Set()), false);
  assert.equal(canReviewOrderItem({ orderStatus: "shipped" }, item, new Set()), false);
  assert.equal(canReviewOrderItem({ orderStatus: "completed" }, item, new Set(["product-1"])), false);
  assert.equal(canReviewOrderItem({ orderStatus: "completed" }, { productId: null }, new Set()), false);
  assert.equal(canReviewOrderItem({ orderStatus: "completed" }, { productId: { _id: "product-1", isActive: false } }, new Set()), false);
});
