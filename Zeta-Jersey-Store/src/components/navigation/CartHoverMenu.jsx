import { ShoppingBag, ArrowRight } from "lucide-react";

export default function CartHoverMenu({
  cartItems = [],
  totalItems = 0,
  onNavigateCart,
  isHome = false,
}) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price ?? item.productId?.price ?? 0) * (item.quantity || 1),
    0
  );

  return (
    <div
      role="region"
      aria-label="Cart preview"
      className={`absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
        isHome
          ? "bg-[#242424]/95 backdrop-blur-xl border border-white/20 text-white"
          : "bg-white border border-gray-100 text-gray-900 ring-1 ring-black/5"
      }`}
    >
      <div
        className={`flex items-center justify-between pb-3 border-b ${
          isHome ? "border-white/15" : "border-gray-100"
        }`}
      >
        <h3
          className={`font-bold text-sm flex items-center gap-1.5 ${
            isHome ? "text-white" : "text-gray-900"
          }`}
        >
          <ShoppingBag className={`w-4 h-4 ${isHome ? "text-zeta-sub" : "text-zeta-main"}`} />
          My Cart
        </h3>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isHome ? "bg-white/10 text-white/80" : "bg-gray-100 text-gray-600"
          }`}
        >
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-7 text-center">
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${
              isHome ? "bg-white/5 text-white/40" : "bg-gray-50 text-gray-400"
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className={`text-sm font-semibold ${isHome ? "text-white/90" : "text-gray-700"}`}>
            Your cart is empty
          </p>
          <p className={`text-xs mt-1 ${isHome ? "text-white/50" : "text-gray-400"}`}>
            Explore our jersey collection to add items!
          </p>
        </div>
      ) : (
        <>
          <div
            className={`max-h-60 overflow-y-auto divide-y py-1 pr-0.5 ${
              isHome ? "divide-white/10" : "divide-gray-100"
            }`}
          >
            {cartItems.slice(0, 4).map((item) => {
              const product = item.productId || {};
              const itemImage =
                product.images?.[0] || product.image || product.imageUrl || item.image || "";
              const itemName = product.name || item.name || "Jersey";
              const itemPrice = item.price ?? product.price ?? 0;
              const itemId = item._id || item.id || `${product._id || product.id}-${item.size}`;

              return (
                <div key={itemId} className="flex items-center gap-3 py-2.5">
                  <img
                    src={itemImage}
                    alt={itemName}
                    className={`h-12 w-12 flex-shrink-0 rounded-lg border object-cover ${
                      isHome ? "border-white/15 bg-black/20" : "border-gray-100 bg-gray-50"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs font-semibold ${
                        isHome ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {itemName}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isHome ? "text-white/60" : "text-gray-500"
                      }`}
                    >
                      Size:{" "}
                      <span className={`font-semibold ${isHome ? "text-white/90" : "text-gray-700"}`}>
                        {item.size}
                      </span>
                      {" • "}
                      Qty:{" "}
                      <span className={`font-semibold ${isHome ? "text-white/90" : "text-gray-700"}`}>
                        {item.quantity}
                      </span>
                    </p>
                    <p
                      className={`text-xs font-bold mt-1 ${
                        isHome ? "text-zeta-sub" : "text-zeta-main"
                      }`}
                    >
                      ฿{Number(itemPrice * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {cartItems.length > 4 && (
              <p
                className={`text-center text-[11px] font-medium pt-2 ${
                  isHome ? "text-white/50" : "text-gray-400"
                }`}
              >
                + {cartItems.length - 4} more {cartItems.length - 4 === 1 ? "item" : "items"} in cart
              </p>
            )}
          </div>

          <div
            className={`border-t pt-3 mt-1 ${
              isHome ? "border-white/15" : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between text-sm mb-3">
              <span className={`font-medium ${isHome ? "text-white/70" : "text-gray-500"}`}>
                Subtotal
              </span>
              <span
                className={`font-extrabold text-base ${
                  isHome ? "text-zeta-sub" : "text-zeta-main"
                }`}
              >
                ฿{subtotal.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={onNavigateCart}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                isHome
                  ? "bg-zeta-sub text-zeta-main hover:bg-zeta-sub-lighter shadow-md"
                  : "bg-zeta-main text-white hover:bg-zeta-main/90"
              }`}
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
