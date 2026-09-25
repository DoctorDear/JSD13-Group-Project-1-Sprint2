import mongoose from "mongoose";
import Stripe from "stripe";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";

const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) throw new Error("Stripe test secret key is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

async function removeOrderItemsFromCart(order) {
  if (!order.userId || order.payment?.cartCleared) return;
  const user = await User.findById(order.userId);
  if (!user) return;
  for (const item of order.items) {
    const productId = String(item.productId?._id || item.productId);
    const cartItem = user.cart.find((entry) => {
      if (item.cartItemId) return String(entry._id) === String(item.cartItemId);
      const orderSecond = Math.floor(new Date(order.createdAt).getTime() / 1000) * 1000;
      const cartSecond = entry._id?.getTimestamp?.().getTime();
      return Number.isFinite(cartSecond) && cartSecond < orderSecond && String(entry.productId?._id || entry.productId) === productId && entry.size === item.size && (entry.customName || "") === (item.customName || "") && (entry.customNumber ?? null) === (item.customNumber ?? null);
    });
    if (!cartItem) continue;
    cartItem.quantity -= item.quantity;
    if (cartItem.quantity <= 0) user.cart.pull(cartItem._id);
  }
  await user.save();
  await Order.updateOne({ _id: order._id }, { $set: { "payment.cartCleared": true } });
}

async function restoreCart(order) {
  if (!order.userId) return;
  const user = await User.findById(order.userId);
  if (!user) return;
  for (const item of order.items) {
    const productId = String(item.productId?._id || item.productId);
    const existing = user.cart.find((cartItem) =>
      String(cartItem.productId?._id || cartItem.productId) === productId &&
      cartItem.size === item.size &&
      (cartItem.customName || "") === (item.customName || "") &&
      (cartItem.customNumber ?? null) === (item.customNumber ?? null),
    );
    if (existing) {
      if (order.payment?.cartCleared) existing.quantity += item.quantity;
    } else {
      user.cart.push({ productId: item.productId, size: item.size, customName: item.customName || "", customNumber: item.customNumber ?? null, quantity: item.quantity, price: item.price });
    }
  }
  await user.save();
}

async function markOrderPaid(order, session) {
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, "payment.reservationState": "held" },
    { $set: { "payment.reservationState": "committed", "payment.status": "paid", "payment.paidAt": new Date(), "payment.transactionId": session.payment_intent || "", orderStatus: "processing" } },
  );
  if (updated) await removeOrderItemsFromCart(updated);
  return updated;
}

async function releaseStock(order) {
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, "payment.reservationState": "held" },
    { $set: { "payment.reservationState": "released", "payment.status": "failed", orderStatus: "cancelled" } },
  );
  if (!claimed) return;
  for (const item of claimed.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
  }
  await restoreCart(claimed);
}

export const createCheckoutSession = (req, res) => createCheckoutSessionWithClient(req, res);

export const createCheckoutSessionWithClient = async (req, res, stripeClient) => {
  let order;
  let session;
  const reserved = [];
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!["card", "promptpay"].includes(paymentMethod)) return res.status(400).json({ success: false, message: "Choose Card or PromptPay" });
    if (paymentMethod === "promptpay" && process.env.STRIPE_PROMPTPAY_ENABLED !== "true") return res.status(400).json({ success: false, message: "PromptPay is not enabled for this Stripe account" });
    if (!shippingAddress || !["recipientName", "phone", "addressLine", "province", "postalCode"].every((key) => typeof shippingAddress[key] === "string" && shippingAddress[key].trim())) {
      return res.status(400).json({ success: false, message: "Complete the shipping address" });
    }
    const client = stripeClient || stripe();
    const heldOrders = await Order.find({ userId: req.user.userId, "payment.reservationState": "held" }).sort({ createdAt: -1 });
    let previousCheckoutExpired = false;
    for (const heldOrder of heldOrders) {
      if (!heldOrder.payment.stripeSessionId) {
        if (heldOrder.payment.reservationExpiresAt && heldOrder.payment.reservationExpiresAt <= new Date()) {
          await releaseStock(heldOrder);
          previousCheckoutExpired = true;
        } else {
          return res.status(409).json({ success: false, message: "An earlier checkout is still being prepared. Please try again shortly." });
        }
        continue;
      }
      const oldSession = await client.checkout.sessions.retrieve(heldOrder.payment.stripeSessionId);
      if (oldSession.payment_status === "paid") {
        await markOrderPaid(heldOrder, oldSession);
      } else if (oldSession.status === "expired") {
        await releaseStock(heldOrder);
        previousCheckoutExpired = true;
      } else {
        await removeOrderItemsFromCart(heldOrder);
      }
    }
    const user = await User.findById(req.user.userId);
    if (previousCheckoutExpired) return res.status(409).json({ success: false, message: "A previous checkout expired. Its items are back in your cart; review the cart before placing a new order." });
    if (!user?.cart?.length) return res.status(400).json({ success: false, message: "Your cart is empty. Add a product before placing a new order." });
    const items = [];
    let totalAmount = 0;
    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.productId);
      const quantity = Number(cartItem.quantity);
      if (!product || product.isActive === false || !Number.isInteger(quantity) || quantity < 1 || !Number.isSafeInteger(Math.round(product.price * 100)) || product.price <= 0 || product.quantity < quantity) {
        return res.status(400).json({ success: false, message: "An item is unavailable or invalid" });
      }
      items.push({ productId: product._id, cartItemId: cartItem._id, sku: product.sku, name: product.name, size: cartItem.size || product.size, price: product.price, quantity, customName: cartItem.customName || "", customNumber: cartItem.customNumber ?? null });
      totalAmount += product.price * quantity;
    }
    for (const item of items) {
      const product = await Product.findOneAndUpdate({ _id: item.productId, quantity: { $gte: item.quantity } }, { $inc: { quantity: -item.quantity } });
      if (!product) {
        for (const held of reserved) await Product.findByIdAndUpdate(held.productId, { $inc: { quantity: held.quantity } });
        return res.status(409).json({ success: false, message: `Insufficient stock for ${item.name}` });
      }
      reserved.push(item);
    }
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
    order = await Order.create({
      userId: req.user.userId,
      orderNumber: `ZT-${new mongoose.Types.ObjectId().toString().toUpperCase()}`,
      items, shippingAddress, totalAmount,
      payment: { method: paymentMethod === "card" ? "Credit Card" : "PromptPay", status: "awaiting_payment", reservationState: "held", reservationExpiresAt: new Date(expiresAt * 1000) },
    });
    const origin = process.env.FRONTEND_URL || "http://localhost:5173";
    session = await client.checkout.sessions.create({
      mode: "payment",
      payment_method_types: [paymentMethod],
      line_items: items.map((item) => ({ price_data: { currency: "thb", unit_amount: Math.round(item.price * 100), product_data: { name: `${item.name} (${item.size})` } }, quantity: item.quantity })),
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      success_url: `${origin}/order-confirmation?orderId=${order.id}`,
      cancel_url: `${origin}/order-confirmation?orderId=${order.id}&cancelled=1`,
      expires_at: expiresAt,
    }, { idempotencyKey: `order-${order.id}` });
    order.payment.stripeSessionId = session.id;
    await order.save();
    await removeOrderItemsFromCart(order);
    return res.status(201).json({ success: true, url: session.url, orderId: order.id });
  } catch (error) {
    if (order && !session) await releaseStock(order);
    if (!order) for (const held of reserved) await Product.findByIdAndUpdate(held.productId, { $inc: { quantity: held.quantity } });
    console.error("Stripe checkout creation failed:", error);
    return res.status(500).json({ success: false, message: "Could not start payment" });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("Missing webhook secret");
    event = stripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send("Invalid Stripe webhook signature");
  }
  try {
    const session = event.data.object;
    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) return res.sendStatus(200);
    const order = await Order.findOne({ $or: [{ "payment.stripeSessionId": session.id }, { _id: mongoose.Types.ObjectId.isValid(session.metadata?.orderId) ? session.metadata.orderId : null }] });
    if (!order) return res.sendStatus(503);
    if ((event.type === "checkout.session.completed" && session.payment_status === "paid") || event.type === "checkout.session.async_payment_succeeded") {
      await markOrderPaid(order, session);
    } else if (["checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) {
      await releaseStock(order);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return res.sendStatus(500);
  }
};

export const syncStripeOrder = async (order) => {
  if (order.payment?.reservationState !== "held" || !order.payment.stripeSessionId) return false;
  const session = await stripe().checkout.sessions.retrieve(order.payment.stripeSessionId);
  if (session.payment_status === "paid") {
    await markOrderPaid(order, session);
    return true;
  }
  if (session.status === "expired") {
    await releaseStock(order);
    return true;
  }
  return false;
};

// Recover terminal Checkout sessions when local webhook forwarding was interrupted.
export const reconcileStripeOrders = async () => {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) return;
  const pending = await Order.find({ "payment.reservationState": "held", "payment.stripeSessionId": { $exists: true } }).limit(50);
  for (const order of pending) {
    try { await syncStripeOrder(order); }
    catch (error) { console.error("Stripe order reconciliation failed:", order.id, error); }
  }
};

export const getStripeAvailability = (_req, res) => res.json({
  card: Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && process.env.STRIPE_WEBHOOK_SECRET),
  promptpay: Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_PROMPTPAY_ENABLED === "true"),
});

export const resumeCheckoutSession = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.userId, "payment.reservationState": "held" });
    if (!order?.payment.stripeSessionId) return res.status(404).json({ success: false, message: "Active checkout not found" });
    const session = await stripe().checkout.sessions.retrieve(order.payment.stripeSessionId);
    if (session.status !== "open") return res.status(409).json({ success: false, message: "This checkout has ended" });
    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not resume checkout" });
  }
};
