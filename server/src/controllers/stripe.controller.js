import mongoose from "mongoose";
import Stripe from "stripe";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";
import { validateShippingAddress } from "../lib/shippingAddressValidation.js";
import {
  normalizePersonalizationName,
  normalizePersonalizationNumber,
  normalizeSleeveBadge,
  samePersonalization,
} from "../lib/personalization.js";
import {
  reserveAndPriceItems,
  rollbackReservedStock,
} from "../services/checkoutReservation.js";

const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) throw new Error("Stripe test secret key is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const paymentMethodLabel = (paymentMethod) =>
  paymentMethod === "card" ? "Credit Card" : "PromptPay";

export function validateStripePaymentMethod(paymentMethod) {
  if (!["card", "promptpay"].includes(paymentMethod)) {
    return "Choose Card or PromptPay";
  }
  if (paymentMethod === "promptpay" && process.env.STRIPE_PROMPTPAY_ENABLED !== "true") {
    return "PromptPay is not enabled for this Stripe account";
  }
  return null;
}

export function buildStripeLineItems(items) {
  return items.map((item) => {
    const customName = item.customName || "";
    const customNumber = normalizePersonalizationNumber(item.customNumber);
    const sleeveBadge = normalizeSleeveBadge(item.sleeveBadge);
    const namePrice = item.namePrice ?? 0;
    const numberPrice = item.numberPrice ?? 0;
    const badgePrice = item.badgePrice ?? 0;

    return {
      price_data: {
        currency: "thb",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: `${item.name} (${item.size})${badgePrice ? ` — ${sleeveBadge}` : ""}`,
          description:
            [
              customName && `Name: ${customName}`,
              customNumber !== null && `Number: ${customNumber}`,
              sleeveBadge !== "none" && `Badge: ${sleeveBadge}`,
            ]
              .filter(Boolean)
              .join("; ") || undefined,
          metadata: {
            customName,
            customNumber: customNumber ?? "",
            sleeveBadge,
            namePrice: String(namePrice),
            numberPrice: String(numberPrice),
            badgePrice: String(badgePrice),
            unitPrice: String(item.price),
          },
        },
      },
      quantity: item.quantity,
    };
  });
}

export function buildCheckoutSessionPayload({ orderId, items, paymentMethod, expiresAt }) {
  const origin = process.env.FRONTEND_URL || "http://localhost:5173";
  return {
    mode: "payment",
    payment_method_types: [paymentMethod],
    line_items: buildStripeLineItems(items),
    client_reference_id: orderId,
    metadata: { orderId },
    success_url: `${origin}/order-confirmation?orderId=${orderId}`,
    cancel_url: `${origin}/order-confirmation?orderId=${orderId}&cancelled=1`,
    expires_at: expiresAt,
  };
}

async function removeOrderItemsFromCart(order) {
  if (!order.userId || order.payment?.cartCleared || order.payment?.cartManaged === false) return;
  const user = await User.findById(order.userId);
  if (!user) return;
  for (const item of order.items) {
    const productId = String(item.productId?._id || item.productId);
    const cartItem = user.cart.find((entry) => {
      if (item.cartItemId) return String(entry._id) === String(item.cartItemId);
      const orderSecond = Math.floor(new Date(order.createdAt).getTime() / 1000) * 1000;
      const cartSecond = entry._id?.getTimestamp?.().getTime();
      return Number.isFinite(cartSecond) && cartSecond < orderSecond && String(entry.productId?._id || entry.productId) === productId && entry.size === item.size && samePersonalization(entry, item);
    });
    if (!cartItem) continue;
    cartItem.quantity -= item.quantity;
    if (cartItem.quantity <= 0) user.cart.pull(cartItem._id);
  }
  await user.save();
  await Order.updateOne({ _id: order._id }, { $set: { "payment.cartCleared": true } });
}

async function restoreCart(order) {
  if (!order.userId || !order.payment?.cartCleared || order.payment?.cartManaged === false) return;
  const user = await User.findById(order.userId);
  if (!user) return;
  for (const item of order.items) {
    const productId = String(item.productId?._id || item.productId);
    const existing = user.cart.find((cartItem) =>
      String(cartItem.productId?._id || cartItem.productId) === productId &&
      cartItem.size === item.size &&
      samePersonalization(cartItem, item),
    );
    if (existing) {
      if (order.payment?.cartCleared) existing.quantity += item.quantity;
      Object.assign(existing, {
        customName: normalizePersonalizationName(item.customName),
        customNumber: normalizePersonalizationNumber(item.customNumber),
        sleeveBadge: normalizeSleeveBadge(item.sleeveBadge),
        namePrice: item.namePrice ?? 0,
        numberPrice: item.numberPrice ?? 0,
        badgePrice: item.badgePrice ?? 0,
        price: item.price,
      });
    } else {
      user.cart.push({ productId: item.productId, size: item.size, customName: normalizePersonalizationName(item.customName), customNumber: normalizePersonalizationNumber(item.customNumber), sleeveBadge: normalizeSleeveBadge(item.sleeveBadge), namePrice: item.namePrice ?? 0, numberPrice: item.numberPrice ?? 0, badgePrice: item.badgePrice ?? 0, quantity: item.quantity, price: item.price });
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

async function releaseStaleRetry(order) {
  const staleBefore = new Date(Date.now() - 2 * 60 * 1000);
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, "payment.status": "failed", "payment.reservationState": "restarting", "payment.retryStartedAt": { $lte: staleBefore } },
    { $set: { "payment.reservationState": "released", "payment.retryStartedAt": null } },
  );
  if (!claimed) return false;
  for (const item of claimed.items) await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
  return true;
}

export const createCheckoutSession = (req, res) => createCheckoutSessionWithClient(req, res);

export const createCheckoutSessionWithClient = async (req, res, stripeClient) => {
  let order;
  let session;
  let client;
  let reserved = [];
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const paymentMethodError = validateStripePaymentMethod(paymentMethod);
    if (paymentMethodError) return res.status(400).json({ success: false, message: paymentMethodError });
    const shippingAddressError = validateShippingAddress(shippingAddress);
    if (shippingAddressError) return res.status(400).json({ success: false, message: shippingAddressError });
    client = stripeClient || stripe();
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
    const sourceOrder = req.sourceOrder;
    const user = sourceOrder ? null : await User.findById(req.user.userId);
    if (previousCheckoutExpired) return res.status(409).json({ success: false, message: "A previous checkout expired. Its items are back in your cart; review the cart before placing a new order." });
    const sourceItems = sourceOrder ? sourceOrder.items : user?.cart;
    if (!sourceItems?.length) return res.status(400).json({ success: false, message: "There are no items available for checkout." });
    const reservation = await reserveAndPriceItems(sourceItems, {
      mode: "stripe",
      preservePricing: Boolean(sourceOrder),
      includeCartItemId: !sourceOrder,
    });
    if (!reservation.ok) {
      return res.status(reservation.status).json({ success: false, message: reservation.message });
    }
    reserved = reservation.reserved;
    const { items, totalAmount } = reservation;
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
    if (sourceOrder) {
      order = await Order.findOneAndUpdate(
        { _id: sourceOrder._id, userId: req.user.userId, "payment.status": "failed", "payment.reservationState": "released" },
        { $set: { "payment.reservationState": "restarting", "payment.retryStartedAt": new Date() } },
        { new: true },
      );
      if (!order) {
        await rollbackReservedStock(reserved);
        return res.status(409).json({ success: false, message: "This order has already changed. Refresh your orders before retrying." });
      }
    } else {
      order = await Order.create({
        userId: req.user.userId,
        orderNumber: `ZT-${new mongoose.Types.ObjectId().toString().toUpperCase()}`,
        items, shippingAddress, totalAmount,
        payment: { method: paymentMethodLabel(paymentMethod), status: "awaiting_payment", reservationState: "held", reservationExpiresAt: new Date(expiresAt * 1000), cartManaged: true },
      });
    }
    session = await client.checkout.sessions.create(
      buildCheckoutSessionPayload({ orderId: order.id, items, paymentMethod, expiresAt }),
      { idempotencyKey: sourceOrder ? `order-${order.id}-retry-${new mongoose.Types.ObjectId()}` : `order-${order.id}` },
    );
    if (sourceOrder) {
      const finalized = await Order.updateOne(
        { _id: order._id, "payment.status": "failed", "payment.reservationState": "restarting", "payment.retryStartedAt": order.payment.retryStartedAt },
        { $set: {
          items, shippingAddress, totalAmount, orderStatus: "pending",
          "payment.method": paymentMethodLabel(paymentMethod),
          "payment.status": "awaiting_payment",
          "payment.reservationState": "held",
          "payment.reservationExpiresAt": new Date(expiresAt * 1000),
          "payment.retryStartedAt": null,
          "payment.cartManaged": false,
          "payment.stripeSessionId": session.id,
        } },
      );
      if (finalized.modifiedCount !== 1) throw new Error("The payment retry was released before Stripe checkout was ready");
    } else {
      order.payment.stripeSessionId = session.id;
      await order.save();
    }
    if (!sourceOrder) await removeOrderItemsFromCart(order);
    return res.status(201).json({ success: true, url: session.url, orderId: order.id });
  } catch (error) {
    if (session) await client.checkout.sessions.expire(session.id).catch(() => {});
    if (req.sourceOrder) {
      const reset = order ? await Order.updateOne(
        { _id: order._id, "payment.reservationState": "restarting", "payment.retryStartedAt": order.payment.retryStartedAt },
        { $set: { "payment.reservationState": "released", "payment.retryStartedAt": null } },
      ) : null;
      if (!order || reset.modifiedCount === 1) {
        await rollbackReservedStock(reserved);
      }
    } else if (order) await releaseStock(order);
    else await rollbackReservedStock(reserved);
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
    // Replaced/expired checkout attempts must not change the current reservation state.
    if (order.payment?.stripeSessionId !== session.id || order.payment?.reservationState === "restarting") return res.sendStatus(200);
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
  if (order.payment?.reservationState === "restarting" && order.payment.status === "failed") return releaseStaleRetry(order);
  if (!["held", "restarting"].includes(order.payment?.reservationState) || !order.payment.stripeSessionId) return false;
  const session = await stripe().checkout.sessions.retrieve(order.payment.stripeSessionId);
  if (order.payment.reservationState === "restarting") {
    order.payment.reservationState = "held";
    await order.save();
  }
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
  const pending = await Order.find({ $or: [
    { "payment.reservationState": "held", "payment.stripeSessionId": { $exists: true } },
    { "payment.reservationState": "restarting" },
  ] }).limit(50);
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

export const retryCheckoutSession = async (req, res) => {
  let order;
  let replacement;
  let client;
  let previousSessionId;
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const paymentMethodError = validateStripePaymentMethod(paymentMethod);
    if (paymentMethodError) return res.status(400).json({ success: false, message: paymentMethodError });

    order = await Order.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!["Credit Card", "PromptPay"].includes(order.payment?.method) || !["awaiting_payment", "failed"].includes(order.payment?.status)) {
      return res.status(409).json({ success: false, message: "This order is not eligible for payment retry" });
    }
    if (order.payment?.status === "paid") return res.status(409).json({ success: false, message: "This order has already been paid" });

    client = stripe();
    if (order.payment.status === "failed" && order.payment.reservationState === "restarting") {
      if (await releaseStaleRetry(order)) order = await Order.findById(order._id);
      else return res.status(409).json({ success: false, message: "A payment retry is still being prepared. Please try again in a couple of minutes." });
    }
    if (order.payment?.reservationState === "held" && order.payment.stripeSessionId) {
      const current = await client.checkout.sessions.retrieve(order.payment.stripeSessionId);
      if (current.payment_status === "paid") {
        await markOrderPaid(order, current);
        return res.status(409).json({ success: false, message: "This order has already been paid" });
      }
      if (current.status === "open") {
        previousSessionId = current.id;
        const claimedOrder = await Order.findOneAndUpdate(
          { _id: order._id, "payment.reservationState": "held", "payment.stripeSessionId": current.id },
          { $set: { "payment.reservationState": "restarting" } },
          { new: true },
        );
        if (!claimedOrder) return res.status(409).json({ success: false, message: "This payment attempt has already changed. Refresh your orders and try again." });
        order = claimedOrder;
        await client.checkout.sessions.expire(current.id);
      } else if (current.status !== "expired") {
        return res.status(409).json({ success: false, message: "The current payment is still processing. Please wait for Stripe to confirm it." });
      }
      if (current.status === "expired") await releaseStock(order);
      else {
        const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
        replacement = await client.checkout.sessions.create(
          buildCheckoutSessionPayload({ orderId: order.id, items: order.items, paymentMethod, expiresAt }),
          { idempotencyKey: `order-${order.id}-retry-${current.id}-${paymentMethod}` },
        );
        order.payment.method = paymentMethodLabel(paymentMethod);
        order.payment.status = "awaiting_payment";
        order.payment.stripeSessionId = replacement.id;
        order.payment.reservationState = "held";
        order.payment.reservationExpiresAt = new Date(expiresAt * 1000);
        await order.save();
        return res.status(201).json({ success: true, url: replacement.url, orderId: order.id });
      }
    }

    // Retry the saved order items independently of the current cart.
    return createCheckoutSessionWithClient({
      ...req,
      body: { shippingAddress: shippingAddress || order.shippingAddress, paymentMethod },
      sourceOrder: order,
    }, res, client);
  } catch (error) {
    if (replacement?.id) await client.checkout.sessions.expire(replacement.id).catch(() => {});
    if (order?.payment?.reservationState === "restarting") {
      const previous = await client.checkout.sessions.retrieve(previousSessionId).catch(() => null);
      order.payment.reservationState = "held";
      await order.save().catch(() => {});
      if (previous?.payment_status === "paid") await markOrderPaid(order, previous).catch(() => {});
      else if (previous?.status === "expired") await releaseStock(order).catch(() => {});
    }
    console.error("Stripe checkout retry failed:", error);
    return res.status(500).json({ success: false, message: "Could not restart payment" });
  }
};
