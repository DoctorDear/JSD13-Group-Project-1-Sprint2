import test from "node:test";
import assert from "node:assert/strict";
import { createErrorHandler } from "./errorHandler.middleware.js";

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

test("createErrorHandler maps CastError, ValidationError, and duplicate key errors cleanly", () => {
  const handler = createErrorHandler({ NODE_ENV: "production" });

  const castRes = makeRes();
  handler({ name: "CastError" }, {}, castRes, () => {});
  assert.equal(castRes.statusCode, 400);
  assert.deepEqual(castRes.body, { success: false, message: "Invalid ID format" });

  const validationRes = makeRes();
  handler(
    {
      name: "ValidationError",
      errors: {
        name: { message: "Name is required" },
        price: { message: "Price must be >= 0" },
      },
    },
    {},
    validationRes,
    () => {},
  );
  assert.equal(validationRes.statusCode, 400);
  assert.deepEqual(validationRes.body, {
    success: false,
    message: "Name is required, Price must be >= 0",
  });

  const dupRes = makeRes();
  handler({ code: 11000 }, {}, dupRes, () => {});
  assert.equal(dupRes.statusCode, 409);
  assert.deepEqual(dupRes.body, {
    success: false,
    message: "Duplicate value for a unique field",
  });
});

test("createErrorHandler hides raw 500 error details in production and exposes them in dev", () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    const prodHandler = createErrorHandler({ NODE_ENV: "production" });
    const prodRes = makeRes();
    prodHandler(new Error("ECONNREFUSED secret-db-host:27017"), {}, prodRes, () => {});
    assert.equal(prodRes.statusCode, 500);
    assert.deepEqual(prodRes.body, {
      success: false,
      message: "Internal server error",
    });

    const devHandler = createErrorHandler({ NODE_ENV: "development" });
    const devRes = makeRes();
    devHandler(new Error("Detailed dev failure"), {}, devRes, () => {});
    assert.equal(devRes.statusCode, 500);
    assert.deepEqual(devRes.body, {
      success: false,
      message: "Detailed dev failure",
    });
  } finally {
    console.error = originalError;
  }
});
