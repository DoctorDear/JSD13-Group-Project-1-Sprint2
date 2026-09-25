import { useState } from "react";
import { Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.js";
import { useWishlist } from "../contexts/wishlistContext.js";
import { isWishlistProductId, wishlistHasProduct } from "../lib/wishlistModel.js";

export default function WishlistButton({ productId, className = "", size = 20 }) {
  const { isAuthenticated, booting } = useAuth();
  const { items, loading, busyId, toggle } = useWishlist();
  const [feedback, setFeedback] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const saved = wishlistHasProduct(items, productId);
  const validId = isWishlistProductId(productId);
  const disabled = booting || !validId || (isAuthenticated && (loading || busyId === productId));
  const waitingForOtherProduct = isAuthenticated && busyId !== null && busyId !== productId;

  const handleClick = async (event) => {
    event.stopPropagation();
    if (waitingForOtherProduct) return;
    setFeedback("");
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if (!await toggle(productId)) {
      setFeedback("Could not update your wishlist. Please try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={waitingForOtherProduct || disabled}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        aria-busy={busyId === productId}
        title={!validId ? "Wishlist is available for catalog products" : undefined}
        className={`group ${className}`}
      >
        <Heart
          size={size}
          fill={saved ? "currentColor" : "none"}
          className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-active:scale-75"
        />
      </button>
      {showLoginPrompt && (
        <div
          role="status"
          className={`fixed top-24 right-4 z-100 w-[calc(100vw-2rem)] max-w-sm border p-4 text-sm text-white shadow-xl ${isHome
            ? "rounded-2xl border-white/20 bg-[#2F2F2F]/90 backdrop-blur-lg"
            : "rounded-xl border-white/10 bg-zeta-main"
            }`}
          onClick={(event) => event.stopPropagation()}
        >
          <p className="font-semibold">Log in to save this item to your wishlist.</p>
          <div className="mt-3 flex items-center gap-4">
            <button type="button" onClick={() => navigate("/auth/login", { state: { from: location } })} className="rounded-full bg-zeta-sub px-4 py-2 font-semibold text-zeta-main transition-colors hover:bg-zeta-sub-lighter">
              Log in
            </button>
            <button type="button" onClick={() => setShowLoginPrompt(false)} className="font-medium text-white/80 hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}
      {feedback && (
        <div role="alert" className="fixed bottom-4 right-4 z-100 rounded-xl bg-red-700 px-4 py-3 text-sm text-white shadow-lg">
          {feedback}
          <button type="button" onClick={(event) => { event.stopPropagation(); setFeedback(""); }} className="ml-3 font-bold underline">Dismiss</button>
        </div>
      )}
    </>
  );
}
