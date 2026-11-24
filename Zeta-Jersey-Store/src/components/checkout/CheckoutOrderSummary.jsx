import CheckOutItemCard from "./CheckOutItemCard";

/**
 * Reusable order summary list, optional discount input, and totals breakdown.
 */
export default function CheckoutOrderSummary({
  items,
  subtotal,
  discount,
  shippingFee,
  total,
  discountCode,
  onDiscountCodeChange,
  showDiscountInput = true,
  discountWrapperClassName = "flex items-center gap-2",
  emptyClassName = "text-xs text-gray-500",
  listClassName = "space-y-4",
  totalsClassName = "space-y-3 text-sm pt-2",
}) {
  return (
    <>
      <div className={listClassName}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <CheckOutItemCard key={item._id || item.id || index} item={item} />
          ))
        ) : (
          <p className={emptyClassName}>No items in cart</p>
        )}
      </div>

      {showDiscountInput && (
        <div className={discountWrapperClassName}>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => onDiscountCodeChange(e.target.value)}
            placeholder="Discount code or gift card"
            className="w-full h-11 px-4 rounded-xl border border-gray-300 text-xs focus:outline-none bg-white text-gray-900"
          />
          <button className="h-11 px-6 bg-[#251b74] hover:bg-indigo-900 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
            Apply
          </button>
        </div>
      )}

      <div className={totalsClassName}>
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-bold text-gray-900">฿{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span className="font-bold text-red-500">-฿{discount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span className="font-bold text-gray-900">฿{shippingFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-gray-900">฿{total.toLocaleString()}</span>
        </div>
      </div>
    </>
  );
}
