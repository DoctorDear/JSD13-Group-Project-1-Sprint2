import { ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import WishlistButton from "../wishlist/WishlistButton.jsx";
import { useAuth } from "../../contexts/authContext.js";
import { cartService } from "../../services/cart.js";
import { getCardImage } from "../../lib/catalog/cardImage.js";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [imageFailed, setImageFailed] = useState(false);
  const [originalFallback, setOriginalFallback] = useState(false);
  const [adding, setAdding] = useState(false);
  const { isAuthenticated, booting } = useAuth();
  const imageSrc = product.imageUrl || product?.images?.[0];
  const cardImage = getCardImage(imageSrc, originalFallback);
  const productId = product._id || product.id;

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    if (adding || booting) return;

    setAdding(true);
    try {
      await cartService.add(
        { productId, product, size: product.sizes?.[0] || "M", quantity: 1 },
        { guest: !isAuthenticated },
      );
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new CustomEvent("cart-feedback", { detail: { type: "success", message: "Added to cart successfully.", isHome: location.pathname === "/" } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent("cart-feedback", { detail: { type: "error", message: error.message || "Could not add this product to your cart. Please try again.", isHome: location.pathname === "/" } }));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product._id || product.id}`)}
      className="card flex w-full max-w-[290px] shrink-0 self-stretch flex-col rounded-xl bg-white-100 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <figure className="relative aspect-square w-full shrink-0 px-5 pt-5">
        {imageSrc && !imageFailed ? (
          <img
            className="h-full w-full rounded-xl object-cover"
            {...cardImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="290"
            height="290"
            onError={() => cardImage.src !== imageSrc ? setOriginalFallback(true) : setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-zeta-main-lighter text-sm text-zeta-muted">
            Image unavailable
          </div>
        )}
        <span className="badge badge-outline absolute top-8 left-7 rounded-xl border-0 font-medium bg-zeta-sub-lighter text-zeta-sub-dark">
          NEW
        </span>
        <WishlistButton
          productId={productId}
          className="absolute top-7 right-7 m-1 rounded-full bg-white p-2 text-zeta-main"
        />
      </figure>
      <div className="card-body flex flex-1 flex-col">
        {product.brand && (
          <p className="h-5 text-xs font-semibold uppercase tracking-[0.14em] text-zeta-muted">
            {product.brand}
          </p>
        )}
        {!product.brand && <div className="h-5" aria-hidden="true" />}
        <h2 className="card-title min-h-[3.5rem] line-clamp-2 text-xl font-bold">
          {product.name}
        </h2>
        <div className="badge badge-outline min-h-8 rounded-xl border-0 bg-zeta-main-lighter font-medium text-zeta-main">
          {product.team || product.category || product.catagory}
        </div>
        <p className="!line-clamp-3 h-[4.5rem] overflow-hidden">
          {product.description}
        </p>
        <div className="mt-auto flex flex-col gap-5">
          <div>
            <div className="flex justify-between text-zeta-muted">
              <span className="">Quantity</span>

              <div className="flex gap-1">
                <span>{product.quantity}</span>
                <span>items</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="">Price</span>
              <span className="text-zeta-main">
                <span className="text-m font-medium mr-0.5">฿</span>
                {product.price.toLocaleString()}
                {/* convert number to string with format */}
              </span>
            </div>
          </div>

          <button type="button" onClick={handleAddToCart} disabled={adding || booting || product.quantity <= 0} className="btn w-full rounded-4xl bg-zeta-main text-white disabled:opacity-60">
            <span>
              <ShoppingCart size={20} />
            </span>
            {adding ? "Adding..." : product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
