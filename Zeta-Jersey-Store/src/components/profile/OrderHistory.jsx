import { useEffect, useState } from "react";
import SleeveBadgeDetails from '../personalization/SleeveBadgeDetails.jsx';
import { Link } from "react-router-dom";
import { orderService } from "../../services/order.js";
import { reviewService } from "../../services/review.js";
import { canReviewOrderItem } from "../../lib/reviews/reviewEligibility.js";

const money = new Intl.NumberFormat("en-TH", { style: "currency", currency: "THB" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });
const statusColors = {
  awaiting_payment: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-700",
};

function OrderItemImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zeta-main-lighter sm:size-20">
      {src && !failed ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className="size-full object-contain" />
      ) : (
        <span className="px-2 text-center text-[10px] text-zeta-muted">Image unavailable</span>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState(null);
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [paymentOptions, setPaymentOptions] = useState({ card: false, promptpay: false });
  const [paymentMethods, setPaymentMethods] = useState({});
  const [retryingOrderId, setRetryingOrderId] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      orderService.getMyOrders({ signal: controller.signal }),
      reviewService.getMyReviews({ signal: controller.signal }),
    ])
      .then(([orderData, reviewData]) => {
        if (!Array.isArray(orderData.orders) || !Array.isArray(reviewData.reviews)) {
          throw new Error("Could not read your orders and reviews.");
        }
        if (controller.signal.aborted) return;
        setOrders(orderData.orders);
        setReviewedProductIds(new Set(reviewData.reviews.map((review) => review.product?.id).filter(Boolean).map(String)));
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || "Could not load your orders.");
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    orderService.getPaymentOptions().then(setPaymentOptions).catch(() => setPaymentOptions({ card: false, promptpay: false }));
  }, []);

  const retryPayment = async (order) => {
    const selected = paymentMethods[order._id];
    const savedMethod = order.payment?.method === "PromptPay" ? "promptpay" : "card";
    const method = selected && paymentOptions[selected]
      ? selected
      : paymentOptions[savedMethod]
        ? savedMethod
        : paymentOptions.card
          ? "card"
          : "promptpay";
    setPaymentError("");
    setRetryingOrderId(order._id);
    try {
      const checkout = await orderService.retryCheckoutSession(order._id, method);
      if (!checkout?.url) throw new Error("Stripe checkout link was not returned. Please try again.");
      window.location.assign(checkout.url);
    } catch (cause) {
      setPaymentError(cause.message || "Could not restart payment. Please try again.");
      setRetryingOrderId("");
    }
  };

  const retry = () => {
    setError("");
    setOrders(null);
    setAttempt((current) => current + 1);
  };

  return (
    <section aria-labelledby="order-history-title">
      <p className="text-xs font-bold tracking-widest text-zeta-muted">ORDER HISTORY</p>
      <h1 id="order-history-title" className="mt-1 text-2xl font-black sm:text-3xl">My Orders</h1>
      <p className="mt-2 text-sm text-zeta-muted">Your purchases, newest first.</p>

      {error ? (
        <div role="alert" className="mt-6 rounded-xl bg-white p-6 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={retry} className="mt-3 font-semibold underline">Retry</button>
        </div>
      ) : orders === null ? (
        <p role="status" className="mt-6 text-sm text-zeta-muted">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zeta-main-lighter bg-white p-8 text-center">
          <p className="font-bold">No orders yet</p>
          <Link to="/products" className="mt-4 inline-block font-semibold text-zeta-main underline">Browse jerseys</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {paymentError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{paymentError}</p>}
          {orders.map((order) => (
            <article key={order._id} className="overflow-hidden rounded-xl border border-zeta-main-lighter bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="break-all font-bold">{order.orderNumber}</h2>
                  <p className="mt-1 text-xs text-zeta-muted">{date.format(new Date(order.createdAt))}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.payment?.status === "failed" ? "failed" : order.payment?.status === "awaiting_payment" ? "awaiting_payment" : order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                  {order.payment?.status === "failed" ? "Payment failed" : order.payment?.status === "awaiting_payment" ? "Payment pending" : order.orderStatus === "processing" && order.payment?.status === "paid" ? "Paid" : order.orderStatus}
                </span>
              </div>
              <p className="mt-4 text-lg font-black">{money.format(order.totalAmount)}</p>
              {order.payment?.method !== "Cash on Delivery" && ["awaiting_payment", "failed"].includes(order.payment?.status) && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-950">
                    {order.payment.status === "failed" ? "Payment was not completed." : "Payment is still pending."}
                  </p>
                  <p className="mt-1 text-xs text-amber-900">Choose a payment method and continue to Stripe. Your order items and address are saved.</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="sr-only" htmlFor={`payment-method-${order._id}`}>Payment method</label>
                    <select
                      id={`payment-method-${order._id}`}
                      value={paymentMethods[order._id] && paymentOptions[paymentMethods[order._id]]
                        ? paymentMethods[order._id]
                        : paymentOptions[order.payment.method === "PromptPay" ? "promptpay" : "card"]
                          ? (order.payment.method === "PromptPay" ? "promptpay" : "card")
                          : paymentOptions.card ? "card" : "promptpay"}
                      onChange={(event) => setPaymentMethods((current) => ({ ...current, [order._id]: event.target.value }))}
                      className="min-h-10 rounded-lg border border-amber-300 bg-white px-3 text-sm"
                    >
                      {paymentOptions.card && <option value="card">Credit Card</option>}
                      {paymentOptions.promptpay && <option value="promptpay">QR PromptPay</option>}
                      {!paymentOptions.card && !paymentOptions.promptpay && <option value="card">Credit Card (unavailable)</option>}
                    </select>
                    <button
                      type="button"
                      onClick={() => retryPayment(order)}
                      disabled={retryingOrderId === order._id || (!paymentOptions.card && !paymentOptions.promptpay)}
                      className="min-h-10 rounded-lg bg-zeta-main px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {retryingOrderId === order._id ? "Opening Stripe…" : order.payment.status === "failed" ? "Try payment again" : "Continue to payment"}
                    </button>
                  </div>
                </div>
              )}
              <details className="mt-4 border-t border-zeta-main-lighter pt-4">
                <summary className="cursor-pointer text-sm font-semibold text-zeta-main">View order details</summary>
                <ul className="mt-4 divide-y divide-zeta-main-lighter">
                  {order.items.map((item, index) => {
                    const productId = item.productId?._id && String(item.productId._id);
                    const productLink = productId && item.productId?.isActive ? `/products/${productId}` : null;
                    const hasReviewed = productId && reviewedProductIds.has(productId);
                    return (
                    <li key={item._id || index} className="py-3 text-sm">
                      <div className="flex justify-between gap-4">
                        {productLink ? (
                          <Link to={productLink} aria-label={`View ${item.name}`} className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zeta-main">
                            <OrderItemImage key={item.productId?.images?.[0] || "no-image"} src={item.productId?.images?.[0]} name={item.name} />
                          </Link>
                        ) : (
                          <OrderItemImage key={item.productId?.images?.[0] || "no-image"} src={item.productId?.images?.[0]} name={item.name} />
                        )}
                        <div className="min-w-0 flex-1">
                          {productLink ? (
                            <Link to={productLink} className="break-words font-semibold text-zeta-main hover:underline focus-visible:underline">{item.name}</Link>
                          ) : (
                            <p className="break-words font-semibold">{item.name}</p>
                          )}
                          <p className="mt-1 text-xs text-zeta-muted">Size {item.size} · Qty {item.quantity}{item.edition ? ` · ${item.edition}` : ""}</p>
                          <SleeveBadgeDetails item={item} />
                          {hasReviewed ? (
                            <span className="mt-2 inline-block text-xs font-semibold text-green-700">Reviewed</span>
                          ) : canReviewOrderItem(order, item, reviewedProductIds) ? (
                            <Link to={`/products/${productId}/review`} className="mt-2 inline-block text-xs font-semibold text-zeta-main underline">Review product</Link>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold">{money.format(item.price)}</p>
                          <p className="text-xs text-zeta-muted">Unit price · {money.format(item.price * item.quantity)} total</p>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
                {order.shippingAddress && (
                  <div className="mt-4 text-sm">
                    <h3 className="font-bold">Shipping address</h3>
                    <p className="mt-1">{order.shippingAddress.recipientName}</p>
                    <p>{[order.shippingAddress.addressLine, order.shippingAddress.district, order.shippingAddress.province, order.shippingAddress.postalCode].filter(Boolean).join(", ")}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                )}
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
