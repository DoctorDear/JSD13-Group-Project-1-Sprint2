import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import WishlistButton from "./WishlistButton.jsx";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = product.imageUrl || product?.images?.[0];

  return (
    <div
      onClick={() => navigate(`/products/${product._id || product.id}`)}
      className="card flex w-full max-w-[290px] shrink-0 self-stretch flex-col rounded-xl bg-white-100 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <figure className="relative aspect-square w-full shrink-0 px-5 pt-5">
        {imageSrc && !imageFailed ? (
          <img
            className="h-full w-full rounded-xl object-cover"
            src={imageSrc}
            alt={product.name}
            onError={() => setImageFailed(true)}
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
          productId={product._id || product.id}
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

          <button className="btn w-full bg-zeta-main text-white rounded-4xl ">
            <span>
              <ShoppingCart size={20} />
            </span>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
