import test from "node:test";
import assert from "node:assert/strict";
import { validateObjectId } from "./validateObjectId.middleware.js";

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("validateObjectId calls next() when param is a valid 24-hex ObjectId", () => {
  const middleware = validateObjectId("id", "product ID");
  let nextCalled = false;
  const res = makeRes();

  middleware({ params: { id: "507f1f77bcf86cd799439011" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.body, null);
});

test("validateObjectId returns 400 and skips next() for malformed, empty, or missing IDs", () => {
  const middleware = validateObjectId("addressId", "address ID");

  for (const badId of ["not-an-id", "123", "", undefined]) {
    let nextCalled = false;
    const res = makeRes();

    middleware({ params: { addressId: badId } }, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
      success: false,
      message: "Invalid address ID format",
    });
  }
});
