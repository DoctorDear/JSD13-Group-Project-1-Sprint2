import test from "node:test";
import assert from "node:assert/strict";
import { readWishlist, wishlistHasProduct, isWishlistProductId } from "./wishlistModel.js";

const productId = "507f1f77bcf86cd799439012";

test("readWishlist removes deleted product references from the API response", () => {
  const product = { _id: productId, name: "Test jersey" };
  assert.deepEqual(readWishlist({ wishlist: [product, null] }), [product]);
});

test("readWishlist rejects a response without a wishlist array", () => {
  assert.throws(
    () => readWishlist({ success: true }),
    (error) => error.message === "Invalid wishlist response",
  );
});

test("wishlistHasProduct checks the exact product ID", () => {
  const items = [{ _id: productId }];
  assert.equal(wishlistHasProduct(items, productId), true);
  assert.equal(wishlistHasProduct(items, "507f1f77bcf86cd799439013"), false);
});

test("isWishlistProductId accepts database IDs and rejects demo IDs", () => {
  assert.equal(isWishlistProductId(productId), true);
  assert.equal(isWishlistProductId("demo-shirt-1"), false);
});
