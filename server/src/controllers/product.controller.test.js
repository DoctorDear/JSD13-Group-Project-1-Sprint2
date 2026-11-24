import test from "node:test";
import assert from "node:assert/strict";
import { Product } from "../models/Product.model.js";
import {
  createProduct,
  updateProduct,
  pickProductPayload,
} from "./product.controller.js";

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

test("pickProductPayload keeps only whitelisted fields and rejects empty or non-object payloads", () => {
  assert.equal(pickProductPayload(null), null);
  assert.equal(pickProductPayload(undefined), null);
  assert.equal(pickProductPayload([]), null);
  assert.equal(pickProductPayload("invalid"), null);
  assert.equal(pickProductPayload({ _id: "hack", role: "admin", $set: {} }), null);

  const cleaned = pickProductPayload({
    _id: "ignored-id",
    __v: 99,
    createdAt: "2020-01-01",
    role: "admin",
    sku: "ZETA-01",
    name: "Home Jersey",
    description: "2026 Home Kit",
    price: 2500,
    quantity: 10,
    isActive: true,
  });

  assert.deepEqual(cleaned, {
    sku: "ZETA-01",
    name: "Home Jersey",
    description: "2026 Home Kit",
    price: 2500,
    quantity: 10,
    isActive: true,
  });
});

test("createProduct returns 400 without calling Product.create when body is empty or invalid", async () => {
  const originalCreate = Product.create;
  let createCalled = false;
  Product.create = async () => {
    createCalled = true;
    return {};
  };

  try {
    const resEmpty = makeRes();
    await createProduct({ body: undefined }, resEmpty, (err) => {
      throw err;
    });
    assert.equal(resEmpty.statusCode, 400);
    assert.deepEqual(resEmpty.body, { error: "Can't create product" });
    assert.equal(createCalled, false);

    const resDisallowedOnly = makeRes();
    await createProduct({ body: { _id: "evil", __v: 1 } }, resDisallowedOnly, (err) => {
      throw err;
    });
    assert.equal(resDisallowedOnly.statusCode, 400);
    assert.equal(createCalled, false);
  } finally {
    Product.create = originalCreate;
  }
});

test("createProduct strips unallowed fields and returns 201 on valid payload", async () => {
  const originalCreate = Product.create;
  let receivedPayload = null;
  Product.create = async (payload) => {
    receivedPayload = payload;
    return { _id: "new-prod", ...payload };
  };

  try {
    const res = makeRes();
    await createProduct(
      {
        body: {
          _id: "should-be-stripped",
          sku: "ZETA-02",
          name: "Away Jersey",
          description: "2026 Away Kit",
          price: 2600,
          quantity: 15,
        },
      },
      res,
      (err) => {
        throw err;
      },
    );

    assert.equal(res.statusCode, 201);
    assert.deepEqual(receivedPayload, {
      sku: "ZETA-02",
      name: "Away Jersey",
      description: "2026 Away Kit",
      price: 2600,
      quantity: 15,
    });
  } finally {
    Product.create = originalCreate;
  }
});

test("updateProduct returns 404 when product is not found and 400 when payload has no allowed fields", async () => {
  const originalFindByIdAndUpdate = Product.findByIdAndUpdate;
  let updateCalls = 0;
  Product.findByIdAndUpdate = async () => {
    updateCalls += 1;
    return null;
  };

  try {
    const resInvalid = makeRes();
    await updateProduct({ params: { id: "507f1f77bcf86cd799439011" }, body: { _id: "bad" } }, resInvalid, (err) => {
      throw err;
    });
    assert.equal(resInvalid.statusCode, 400);
    assert.equal(updateCalls, 0);

    const resMissing = makeRes();
    await updateProduct(
      { params: { id: "507f1f77bcf86cd799439011" }, body: { price: 2700 } },
      resMissing,
      (err) => {
        throw err;
      },
    );
    assert.equal(updateCalls, 1);
    assert.equal(resMissing.statusCode, 404);
    assert.deepEqual(resMissing.body, { error: "Product not found" });
  } finally {
    Product.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});
