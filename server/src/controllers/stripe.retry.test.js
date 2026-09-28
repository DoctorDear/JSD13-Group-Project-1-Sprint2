import test from "node:test";
import assert from "node:assert/strict";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";
import { createCheckoutSessionWithClient } from "./stripe.controller.js";

test("failed payment retry keeps the original order number and ID", async () => {
  const originals = {
    orderFind: Order.find,
    orderFindOneAndUpdate: Order.findOneAndUpdate,
    orderCreate: Order.create,
    productFindById: Product.findById,
    productFindOneAndUpdate: Product.findOneAndUpdate,
    userFindById: User.findById,
  };
  const order = {
    _id: "original-order-id",
    id: "original-order-id",
    orderNumber: "ZT-ORIGINAL",
    userId: "user-id",
    items: [{ productId: "product-id", sku: "SKU-1", name: "Jersey", size: "M", price: 2900, quantity: 1, customName: "", customNumber: null, sleeveBadge: "none" }],
    payment: { status: "failed", reservationState: "released", cartManaged: true, stripeSessionId: "old-session" },
    async save() {},
  };
  let createdSession;
  let createdOrder = false;
  let reserved = 0;
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  try {
    Order.find = () => ({ sort: async () => [] });
    Order.findOneAndUpdate = async (filter, update) => {
      assert.equal(filter._id, order._id);
      assert.equal(filter["payment.status"], "failed");
      order.payment.reservationState = update.$set["payment.reservationState"];
      return order;
    };
    Order.create = async () => { createdOrder = true; throw new Error("retry must reuse the order"); };
    Product.findById = async () => ({ _id: "product-id", sku: "SKU-1", name: "Jersey", isActive: true, quantity: 10 });
    Product.findOneAndUpdate = async () => { reserved += 1; return { _id: "product-id" }; };
    User.findById = async () => { throw new Error("retry must not read the cart"); };
    const client = { checkout: { sessions: { create: async (params) => { createdSession = params; return { id: "new-session", url: "https://checkout.stripe.test/new" }; } } } };

    await createCheckoutSessionWithClient({
      user: { userId: "user-id" },
      sourceOrder: order,
      body: {
        paymentMethod: "card",
        shippingAddress: { recipientName: "Jane Doe", phone: "0812345678", addressLine: "123 Main Street", province: "Bangkok", district: "Bang Rak", subdistrict: "Si Lom", postalCode: "10500" },
      },
    }, response, client);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.orderId, "original-order-id");
    assert.equal(order.orderNumber, "ZT-ORIGINAL");
    assert.equal(order.payment.status, "awaiting_payment");
    assert.equal(order.payment.stripeSessionId, "new-session");
    assert.equal(order.payment.cartManaged, false);
    assert.equal(createdSession.client_reference_id, "original-order-id");
    assert.equal(createdOrder, false);
    assert.equal(reserved, 1);
  } finally {
    Order.find = originals.orderFind;
    Order.findOneAndUpdate = originals.orderFindOneAndUpdate;
    Order.create = originals.orderCreate;
    Product.findById = originals.productFindById;
    Product.findOneAndUpdate = originals.productFindOneAndUpdate;
    User.findById = originals.userFindById;
  }
});
