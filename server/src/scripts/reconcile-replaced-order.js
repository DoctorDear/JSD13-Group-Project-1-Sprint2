import mongoose from "mongoose";
import Stripe from "stripe";
import Order from "../models/Order.model.js";

const [failedNumber, paidNumber, flag] = process.argv.slice(2);
if (!failedNumber || !paidNumber || (flag && flag !== "--apply")) {
  console.error("Usage: node src/scripts/reconcile-replaced-order.js <failed-order-number> <paid-order-number> [--apply]");
  process.exit(1);
}
if (!process.env.MONGODB_URI || !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
  console.error("MONGODB_URI and a Stripe test secret key are required.");
  process.exit(1);
}

const itemKey = (item) => JSON.stringify([
  String(item.productId), item.size, item.quantity, item.price,
  item.customName || "", item.customNumber == null ? null : String(item.customNumber), item.sleeveBadge || "none",
]);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const [failed, paid] = await Promise.all([
    Order.findOne({ orderNumber: failedNumber }),
    Order.findOne({ orderNumber: paidNumber }),
  ]);
  if (!failed || !paid) throw new Error("Both order numbers must exist.");
  if (failed.payment.status !== "failed" || failed.payment.reservationState !== "released") throw new Error("The old order is not a released failed payment.");
  if (paid.payment.status !== "paid" || paid.payment.reservationState !== "committed") throw new Error("The replacement order is not paid.");
  if (String(failed.userId) !== String(paid.userId)) throw new Error("The orders belong to different users.");
  if (failed.totalAmount !== paid.totalAmount ||
      JSON.stringify(failed.items.map(itemKey).sort()) !== JSON.stringify(paid.items.map(itemKey).sort())) {
    throw new Error("The order items or amounts differ; reconcile manually.");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paidSession = await stripe.checkout.sessions.retrieve(paid.payment.stripeSessionId);
  if (paidSession.payment_status !== "paid" || paidSession.metadata?.orderId !== paid.id) throw new Error("Stripe does not confirm payment for the replacement order.");
  if (failed.payment.stripeSessionId) {
    const failedSession = await stripe.checkout.sessions.retrieve(failed.payment.stripeSessionId);
    if (failedSession.payment_status === "paid") throw new Error("The old Stripe session is paid; stop and investigate a possible double charge.");
  }
  console.log(`Verified ${failed.orderNumber} was replaced by paid order ${paid.orderNumber}.`);
  if (flag === "--apply") {
    const result = await Order.updateOne(
      { _id: failed._id, "payment.status": "failed", "payment.reservationState": "released" },
      { $set: { "payment.status": "superseded", "payment.replacedBy": paid._id } },
    );
    if (result.modifiedCount !== 1) throw new Error("The old order changed before it could be reconciled.");
    console.log("The old order is now marked Replaced and cannot be paid again.");
  } else console.log("Dry run only. Pass --apply after reviewing the matched orders.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
