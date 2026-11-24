/**
 * Payment method selector for Credit Card, QR PromptPay, and Cash on Delivery.
 */
export default function CheckoutPaymentSection({
  paymentMethod,
  onSelectPaymentMethod,
  paymentOptions,
  retryOrderId,
}) {
  const methods = [
    {
      id: "card",
      label: "Credit Card",
      detail: paymentOptions.card
        ? "Pay securely with Stripe test checkout"
        : "Unavailable until Stripe test keys are configured",
      badges: "VISA · MC",
      disabled: !paymentOptions.card,
    },
    {
      id: "promptpay",
      label: "QR PromptPay",
      detail: paymentOptions.promptpay
        ? "Pay with Stripe test checkout"
        : "Unavailable for this Stripe test account",
      badges: "PromptPay",
      disabled: !paymentOptions.promptpay,
    },
    {
      id: "cod",
      label: "Cash on Delivery",
      detail: retryOrderId
        ? "Unavailable when retrying an online payment"
        : "Pay when your order is delivered",
      badges: "",
      disabled: Boolean(retryOrderId),
    },
  ];

  return (
    <section aria-labelledby="payment-title">
      <h2 id="payment-title" className="mb-4 text-xl font-bold text-gray-900">
        Payment
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        Card and PromptPay open Stripe test checkout. Cash on Delivery is paid on delivery.
      </p>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {methods.map((method, index) => (
          <label
            key={method.id}
            className={`flex items-center justify-between gap-4 p-4 ${
              method.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${index < 2 ? "border-b border-gray-100" : ""} ${
              paymentMethod === method.id ? "bg-blue-50/40" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                disabled={method.disabled}
                onChange={() => onSelectPaymentMethod(method.id)}
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">{method.label}</span>
                <span className="block text-xs text-gray-500">{method.detail}</span>
              </span>
            </span>
            {method.badges && (
              <span className="shrink-0 text-xs font-semibold text-gray-500">{method.badges}</span>
            )}
          </label>
        ))}
      </div>
    </section>
  );
}
