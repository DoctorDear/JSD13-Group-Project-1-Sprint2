import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";
import { createCheckoutSessionWithClient, stripeWebhook } from "./stripe.controller.js";

const signingSecret = "whsec_test_signature_secret";
const client = new Stripe("sk_test_local_test_key");

async function deliver(type, paymentStatus, state) {
  const payload = JSON.stringify({ id: `evt_${type}`, type, data: { object: { id: "cs_test_order", payment_status: paymentStatus, payment_intent: "pi_test" } } });
  const req = { body: Buffer.from(payload), headers: { "stripe-signature": client.webhooks.generateTestHeaderString({ payload, secret: signingSecret }) } };
  const res = { code: 200, status(code) { this.code = code; return this; }, sendStatus(code) { this.code = code; return this; }, send() { return this; } };
  await stripeWebhook(req, res);
  assert.equal(res.code, 200);
  return state;
}

test("Stripe webhook commits paid stock once and never releases it on a later expiry", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_local_test_key";
  process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
  const originalFindOne = Order.findOne;
  const originalUpdate = Order.findOneAndUpdate;
  const originalProductUpdate = Product.findByIdAndUpdate;
  const state = { reservation: "held", stockAdded: 0, status: "awaiting_payment" };
  try {
    Order.findOne = async () => ({ _id: "order-1", items: [{ productId: "product-1", quantity: 2 }] });
    Order.findOneAndUpdate = async (filter, update) => {
      if (filter["payment.reservationState"] !== state.reservation) return null;
      state.reservation = update.$set["payment.reservationState"];
      state.status = update.$set["payment.status"];
      return { items: [{ productId: "product-1", quantity: 2 }] };
    };
    Product.findByIdAndUpdate = async (_id, update) => { state.stockAdded += update.$inc.quantity; };
    await deliver("checkout.session.completed", "paid", state);
    await deliver("checkout.session.completed", "paid", state);
    await deliver("checkout.session.expired", "unpaid", state);
    assert.equal(state.status, "paid");
    assert.equal(state.reservation, "committed");
    assert.equal(state.stockAdded, 0);
  } finally {
    Order.findOne = originalFindOne;
    Order.findOneAndUpdate = originalUpdate;
    Product.findByIdAndUpdate = originalProductUpdate;
  }
});

test("Stripe expiry releases reserved stock once", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_local_test_key";
  process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
  const originalFindOne = Order.findOne;
  const originalUpdate = Order.findOneAndUpdate;
  const originalProductUpdate = Product.findByIdAndUpdate;
  const state = { reservation: "held", stockAdded: 0 };
  try {
    Order.findOne = async () => ({ _id: "order-1", items: [{ productId: "product-1", quantity: 2 }] });
    Order.findOneAndUpdate = async (filter, update) => {
      if (filter["payment.reservationState"] !== state.reservation) return null;
      state.reservation = update.$set["payment.reservationState"];
      return { items: [{ productId: "product-1", quantity: 2 }] };
    };
    Product.findByIdAndUpdate = async (_id, update) => { state.stockAdded += update.$inc.quantity; };
    await deliver("checkout.session.expired", "unpaid", state);
    await deliver("checkout.session.expired", "unpaid", state);
    assert.equal(state.reservation, "released");
    assert.equal(state.stockAdded, 2);
  } finally {
    Order.findOne = originalFindOne;
    Order.findOneAndUpdate = originalUpdate;
    Product.findByIdAndUpdate = originalProductUpdate;
  }
});

test("Stripe webhook rejects a body without a valid signature", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_local_test_key";
  process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
  const req = { body: Buffer.from("{}"), headers: { "stripe-signature": "invalid" } };
  const res = { code: 200, status(code) { this.code = code; return this; }, send() { return this; } };
  await stripeWebhook(req, res);
  assert.equal(res.code, 400);
});

test("a new cart creates a new Checkout Session even while an older order is held", async () => {
  const original = {
    find: Order.find,
    create: Order.create,
    updateOne: Order.updateOne,
    findUser: User.findById,
    findProduct: Product.findById,
    reserveProduct: Product.findOneAndUpdate,
  };
  const cart = [{ _id: "cart-new", productId: "product-new", size: "M", quantity: 1 }];
  cart.pull = (id) => {
    const index = cart.findIndex((item) => item._id === id);
    if (index >= 0) cart.splice(index, 1);
  };
  const user = { cart, save: async () => {} };
  let createdOrder;
  try {
    Order.find = () => ({ sort: async () => [{ id: "old-order", payment: { stripeSessionId: "cs_old", reservationState: "held", cartCleared: true } }] });
    User.findById = async () => user;
    Product.findById = async () => ({ _id: "product-new", sku: "SKU-NEW", name: "New jersey", size: "M", price: 1200, quantity: 5 });
    Product.findOneAndUpdate = async () => ({ _id: "product-new" });
    Order.create = async (input) => {
      createdOrder = { ...input, id: "new-order", _id: "new-order", save: async () => {} };
      return createdOrder;
    };
    Order.updateOne = async () => ({ modifiedCount: 1 });
    const client = { checkout: { sessions: {
      retrieve: async () => ({ status: "open", payment_status: "unpaid", url: "https://checkout.stripe.com/old" }),
      create: async () => ({ id: "cs_new", url: "https://checkout.stripe.com/new" }),
    } } };
    const req = { user: { userId: "user-1" }, body: { paymentMethod: "card", shippingAddress: { recipientName: "Jane Doe", phone: "123", addressLine: "1 Main St", province: "Bangkok", postalCode: "10000" } } };
    const res = { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await createCheckoutSessionWithClient(req, res, client);
    assert.equal(res.code, 201);
    assert.equal(res.body.url, "https://checkout.stripe.com/new");
    assert.equal(createdOrder.items.length, 1);
    assert.equal(createdOrder.items[0].productId, "product-new");
    assert.equal(cart.length, 0);
  } finally {
    Order.find = original.find;
    Order.create = original.create;
    Order.updateOne = original.updateOne;
    User.findById = original.findUser;
    Product.findById = original.findProduct;
    Product.findOneAndUpdate = original.reserveProduct;
  }
});
