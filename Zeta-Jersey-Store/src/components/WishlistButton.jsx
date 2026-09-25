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
  const navigate = useNavigate();
  const location = useLocation();
  const saved = wishlistHasProduct(items, productId);
  const validId = isWishlistProductId(productId);
  const disabled = booting || !validId || (isAuthenticated && (loading || busyId === productId));
  const waitingForOtherProduct = isAuthenticated && busyId !== null && busyId !== productId;

  const handleClick = async (event) => {
    event.stopPropagation();
    if (waitingForOtherProduct) return;
    setFeedback("");
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: location } });
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
      {feedback && (
        <div role="alert" className="fixed bottom-4 right-4 z-100 rounded-xl bg-red-700 px-4 py-3 text-sm text-white shadow-lg">
          {feedback}
          <button type="button" onClick={(event) => { event.stopPropagation(); setFeedback(""); }} className="ml-3 font-bold underline">Dismiss</button>
        </div>
      )}
    </>
  );
}
