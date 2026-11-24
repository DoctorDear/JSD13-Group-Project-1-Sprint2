import test from "node:test";
import assert from "node:assert/strict";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";
import {
  buildCheckoutSessionPayload,
  buildStripeLineItems,
  createCheckoutSessionWithClient,
  syncStripeOrder,
  validateStripePaymentMethod,
} from "./stripe.controller.js";

test("failed payment retry keeps the original order number and ID", async () => {
  const originals = {
    orderFind: Order.find,
    orderFindOneAndUpdate: Order.findOneAndUpdate,
    orderUpdateOne: Order.updateOne,
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
      order.payment.retryStartedAt = update.$set["payment.retryStartedAt"];
      return order;
    };
    Order.updateOne = async (filter, update) => {
      assert.equal(filter["payment.reservationState"], "restarting");
      assert.equal(filter["payment.retryStartedAt"], order.payment.retryStartedAt);
      Object.assign(order, { items: update.$set.items, shippingAddress: update.$set.shippingAddress, totalAmount: update.$set.totalAmount });
      order.payment.status = update.$set["payment.status"];
      order.payment.reservationState = update.$set["payment.reservationState"];
      order.payment.stripeSessionId = update.$set["payment.stripeSessionId"];
      order.payment.cartManaged = update.$set["payment.cartManaged"];
      return { modifiedCount: 1 };
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
    Order.updateOne = originals.orderUpdateOne;
    Order.create = originals.orderCreate;
    Product.findById = originals.productFindById;
    Product.findOneAndUpdate = originals.productFindOneAndUpdate;
    User.findById = originals.userFindById;
  }
});

test("stale failed retry releases reserved stock once", async () => {
  const originalFindOneAndUpdate = Order.findOneAndUpdate;
  const originalProductUpdate = Product.findByIdAndUpdate;
  const order = {
    _id: "stuck-order-id",
    payment: { status: "failed", reservationState: "restarting", retryStartedAt: new Date(Date.now() - 3 * 60 * 1000) },
    items: [{ productId: "product-id", quantity: 2 }],
  };
  let releases = 0;
  try {
    Order.findOneAndUpdate = async (filter) => {
      assert.equal(filter["payment.status"], "failed");
      assert.equal(filter["payment.reservationState"], "restarting");
      assert.ok(order.payment.retryStartedAt <= filter["payment.retryStartedAt"].$lte);
      return releases === 0 ? order : null;
    };
    Product.findByIdAndUpdate = async (_id, update) => { releases += update.$inc.quantity; };
    assert.equal(await syncStripeOrder(order), true);
    assert.equal(await syncStripeOrder(order), false);
    assert.equal(releases, 2);
  } finally {
    Order.findOneAndUpdate = originalFindOneAndUpdate;
    Product.findByIdAndUpdate = originalProductUpdate;
  }
});

test("validateStripePaymentMethod validates card, promptpay flag, and unsupported methods", () => {
  const prevPromptPay = process.env.STRIPE_PROMPTPAY_ENABLED;
  try {
    assert.equal(validateStripePaymentMethod("card"), null);
    assert.equal(validateStripePaymentMethod("cod"), "Choose Card or PromptPay");

    process.env.STRIPE_PROMPTPAY_ENABLED = "false";
    assert.equal(validateStripePaymentMethod("promptpay"), "PromptPay is not enabled for this Stripe account");

    process.env.STRIPE_PROMPTPAY_ENABLED = "true";
    assert.equal(validateStripePaymentMethod("promptpay"), null);
  } finally {
    if (prevPromptPay === undefined) delete process.env.STRIPE_PROMPTPAY_ENABLED;
    else process.env.STRIPE_PROMPTPAY_ENABLED = prevPromptPay;
  }
});

test("buildStripeLineItems and buildCheckoutSessionPayload format THB amounts, descriptions, and metadata", () => {
  const prevFrontendUrl = process.env.FRONTEND_URL;
  try {
    process.env.FRONTEND_URL = "https://zeta.example.com";
    const items = [
      {
        name: "Liverpool Home",
        size: "L",
        price: 3350,
        quantity: 2,
        customName: "SALAH",
        customNumber: "11",
        sleeveBadge: "premier-league",
        namePrice: 200,
        numberPrice: 150,
        badgePrice: 100,
      },
    ];

    const lineItems = buildStripeLineItems(items);
    assert.equal(lineItems.length, 1);
    assert.equal(lineItems[0].price_data.currency, "thb");
    assert.equal(lineItems[0].price_data.unit_amount, 335000);
    assert.equal(lineItems[0].price_data.product_data.name, "Liverpool Home (L) — premier-league");
    assert.equal(lineItems[0].price_data.product_data.description, "Name: SALAH; Number: 11; Badge: premier-league");
    assert.deepEqual(lineItems[0].price_data.product_data.metadata, {
      customName: "SALAH",
      customNumber: "11",
      sleeveBadge: "premier-league",
      namePrice: "200",
      numberPrice: "150",
      badgePrice: "100",
      unitPrice: "3350",
    });

    const payload = buildCheckoutSessionPayload({
      orderId: "order-123",
      items,
      paymentMethod: "card",
      expiresAt: 1700000000,
    });
    assert.equal(payload.mode, "payment");
    assert.deepEqual(payload.payment_method_types, ["card"]);
    assert.equal(payload.client_reference_id, "order-123");
    assert.deepEqual(payload.metadata, { orderId: "order-123" });
    assert.equal(payload.success_url, "https://zeta.example.com/order-confirmation?orderId=order-123");
    assert.equal(payload.cancel_url, "https://zeta.example.com/order-confirmation?orderId=order-123&cancelled=1");
    assert.equal(payload.expires_at, 1700000000);
  } finally {
    if (prevFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = prevFrontendUrl;
  }
});
