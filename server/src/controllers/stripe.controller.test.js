import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";
import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { createCheckoutSessionWithClient, stripeWebhook } from "./stripe.controller.js";

const activeTemplate = {
  groupId: "LFC-2627-HOME", active: true, backImageUrl: "/images/back.jpeg", viewBox: [0, 0, 1000, 1000],
  name: { x: 500, y: 250, fontId: "barlow-condensed-900", fontSize: 80, fontWeight: 900, letterSpacing: 4, fill: "#fff", stroke: "#000", strokeWidth: 3 },
  number: { x: 500, y: 600, fontId: "barlow-condensed-900", fontSize: 315, fontWeight: 900, letterSpacing: 4, fill: "#fff", stroke: "#000", strokeWidth: 5 },
  sleeveBadge: { x: 789, y: 293, rotate: -15, skewY: 8, scaleX: 0.684, scaleY: 1.032, zoomViewBox: [710, 175, 175, 310], clipPath: "M 740 175 L 787 175 Q 809 230 816 275 Q 828 335 841 421 L 740 460 Z" },
  sleeveBadgeOptions: ["none", "premier-league", "premier-league-racism"],
};

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

test("Stripe checkout re-prices personalization from the active template for the order and Stripe line item", async (context) => {
  const original = {
    find: Order.find,
    create: Order.create,
    updateOne: Order.updateOne,
    findUser: User.findById,
    findProduct: Product.findById,
    reserveProduct: Product.findOneAndUpdate,
  };
  const cart = [{ _id: "cart-badge", productId: "jersey", size: "M", quantity: 1, customName: "salah", customNumber: "11", sleeveBadge: "premier-league-racism", namePrice: 0, numberPrice: 0, badgePrice: 0, price: 1 }];
  cart.pull = (item) => { const id = item?._id || item; const index = cart.findIndex((entry) => entry._id === id); if (index >= 0) cart.splice(index, 1); };
  const user = { cart, save: async () => {} };
  let createdOrder;
  let stripeLineItem;
  try {
    Order.find = () => ({ sort: async () => [] });
    User.findById = async () => user;
    Product.findById = async () => ({ _id: "jersey", sku: "LFC-STADIUM", name: "Liverpool FC 2026/27 Home Jersey", groupId: "LFC-2627-HOME", price: 2900, quantity: 5, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" });
    context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate);
    Product.findOneAndUpdate = async () => ({ _id: "jersey" });
    Order.create = async (input) => {
      createdOrder = { ...input, id: "badge-order", _id: "badge-order", payment: input.payment, save: async () => {} };
      return createdOrder;
    };
    Order.updateOne = async () => ({ modifiedCount: 1 });
    const client = { checkout: { sessions: {
      create: async (input) => { stripeLineItem = input.line_items[0]; return { id: "cs_badge", url: "https://checkout.stripe.com/badge" }; },
    } } };
    const req = { user: { userId: "user-1" }, body: { paymentMethod: "card", shippingAddress: { recipientName: "Jane Doe", phone: "123", addressLine: "1 Main St", province: "Bangkok", postalCode: "10000" } } };
    const res = { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await createCheckoutSessionWithClient(req, res, client);
    assert.equal(res.code, 201);
    assert.equal(createdOrder.totalAmount, 4850);
    assert.equal(createdOrder.items[0].price, 4850);
    assert.equal(createdOrder.items[0].sleeveBadge, "premier-league-racism");
    assert.equal(createdOrder.items[0].customName, "SALAH");
    assert.equal(createdOrder.items[0].customNumber, "11");
    assert.equal(createdOrder.items[0].namePrice, 400);
    assert.equal(createdOrder.items[0].numberPrice, 700);
    assert.equal(createdOrder.items[0].badgePrice, 850);
    assert.equal(stripeLineItem.price_data.unit_amount, 485000);
    assert.deepEqual(stripeLineItem.price_data.product_data.metadata, { customName: "SALAH", customNumber: "11", sleeveBadge: "premier-league-racism", namePrice: "400", numberPrice: "700", badgePrice: "850", unitPrice: "4850" });
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

test("Stripe checkout rejects missing active templates before reserving stock", async (context) => {
  const original = { find: Order.find, findUser: User.findById, findProduct: Product.findById, reserveProduct: Product.findOneAndUpdate };
  const cart = [{ productId: "jersey", size: "M", quantity: 1, customName: "SALAH", customNumber: "11" }];
  const user = { cart, save: async () => {} };
  let reserved = false;
  try {
    Order.find = () => ({ sort: async () => [] });
    User.findById = async () => user;
    Product.findById = async () => ({ _id: "jersey", sku: "LFC", name: "Liverpool Home", price: 2900, quantity: 5, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" });
    context.mock.method(PersonalizationTemplate, "findOne", async () => null);
    Product.findOneAndUpdate = async () => { reserved = true; return { _id: "jersey" }; };
    const client = { checkout: { sessions: { create: async () => ({ id: "cs", url: "https://checkout.stripe.com" }) } } };
    const req = { user: { userId: "user-1" }, body: { paymentMethod: "card", shippingAddress: { recipientName: "Jane Doe", phone: "123", addressLine: "1 Main St", province: "Bangkok", postalCode: "10000" } } };
    const res = { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await createCheckoutSessionWithClient(req, res, client);
    assert.equal(res.code, 400);
    assert.equal(reserved, false);
  } finally {
    Order.find = original.find;
    User.findById = original.findUser;
    Product.findById = original.findProduct;
    Product.findOneAndUpdate = original.reserveProduct;
  }
});

test("expired Stripe checkout restores the saved badge and does not merge another badge line", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_local_test_key";
  process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
  const original = { findOne: Order.findOne, findOneAndUpdate: Order.findOneAndUpdate, findUser: User.findById, restock: Product.findByIdAndUpdate };
  const cart = [{ _id: "cart-1", productId: "jersey", size: "M", sleeveBadge: "premier-league", badgePrice: 450, price: 3350, quantity: 1 }];
  cart.pull = (item) => { const index = cart.findIndex((entry) => entry._id === (item?._id || item)); if (index >= 0) cart.splice(index, 1); };
  const user = { cart, save: async () => {} };
  const order = {
    _id: "order-1", userId: "user-1", createdAt: new Date(),
    items: [{ productId: "jersey", size: "M", quantity: 1, price: 3750, sleeveBadge: "premier-league-racism", badgePrice: 850, customName: "ALEX", customNumber: 22 }],
    payment: { reservationState: "held", cartCleared: true },
  };
  try {
    Order.findOne = async () => order;
    Order.findOneAndUpdate = async (filter, update) => {
      if (filter["payment.reservationState"] !== order.payment.reservationState) return null;
      Object.assign(order.payment, { reservationState: update.$set["payment.reservationState"], status: update.$set["payment.status"] });
      return order;
    };
    User.findById = async () => user;
    Product.findByIdAndUpdate = async () => {};
    await deliver("checkout.session.expired", "unpaid", {});
    assert.equal(cart.length, 2);
    const restored = cart.find((item) => item.sleeveBadge === "premier-league-racism");
    assert.deepEqual({ badgePrice: restored.badgePrice, price: restored.price, customName: restored.customName, customNumber: restored.customNumber }, {
      badgePrice: 850, price: 3750, customName: "ALEX", customNumber: "22",
    });
  } finally {
    Order.findOne = original.findOne;
    Order.findOneAndUpdate = original.findOneAndUpdate;
    User.findById = original.findUser;
    Product.findByIdAndUpdate = original.restock;
  }
});

test("Stripe expiry restores string zero and double-zero as separate personalized lines", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_local_test_key";
  process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
  const original = { findOne: Order.findOne, findOneAndUpdate: Order.findOneAndUpdate, findUser: User.findById, restock: Product.findByIdAndUpdate };
  const cart = [
    { _id: "cart-zero", productId: "jersey", size: "M", customName: "SALAH", customNumber: "0", sleeveBadge: "premier-league", namePrice: 0, numberPrice: 0, badgePrice: 0, price: 1, quantity: 1 },
    { _id: "cart-double-zero", productId: "jersey", size: "M", customName: "SALAH", customNumber: "00", sleeveBadge: "premier-league-racism", namePrice: 400, numberPrice: 700, badgePrice: 850, price: 4850, quantity: 1 },
  ];
  cart.pull = (item) => { const index = cart.findIndex((entry) => entry._id === (item?._id || item)); if (index >= 0) cart.splice(index, 1); };
  const user = { cart, save: async () => {} };
  const order = {
    _id: "order-1", userId: "user-1", createdAt: new Date(),
    items: [
      { productId: "jersey", size: "M", quantity: 2, price: 4100, sleeveBadge: "premier-league", badgePrice: 450, namePrice: 400, numberPrice: 350, customName: "SALAH", customNumber: 0 },
      { productId: "jersey", size: "M", quantity: 3, price: 4850, sleeveBadge: "premier-league-racism", badgePrice: 850, namePrice: 400, numberPrice: 700, customName: "SALAH", customNumber: "00" },
    ],
    payment: { reservationState: "held", cartCleared: true },
  };
  try {
    Order.findOne = async () => order;
    Order.findOneAndUpdate = async (filter, update) => {
      if (filter["payment.reservationState"] !== order.payment.reservationState) return null;
      Object.assign(order.payment, { reservationState: update.$set["payment.reservationState"], status: update.$set["payment.status"] });
      return order;
    };
    User.findById = async () => user;
    Product.findByIdAndUpdate = async () => {};
    await deliver("checkout.session.expired", "unpaid", {});
    assert.equal(cart.length, 2);
    assert.deepEqual(cart.map(({ customNumber, sleeveBadge, quantity, price, namePrice, numberPrice, badgePrice }) => ({ customNumber, sleeveBadge, quantity, price, namePrice, numberPrice, badgePrice })), [
      { customNumber: "0", sleeveBadge: "premier-league", quantity: 3, price: 4100, namePrice: 400, numberPrice: 350, badgePrice: 450 },
      { customNumber: "00", sleeveBadge: "premier-league-racism", quantity: 4, price: 4850, namePrice: 400, numberPrice: 700, badgePrice: 850 },
    ]);
  } finally {
    Order.findOne = original.findOne;
    Order.findOneAndUpdate = original.findOneAndUpdate;
    User.findById = original.findUser;
    Product.findByIdAndUpdate = original.restock;
  }
});
