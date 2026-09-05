import { ShoppingCart } from "lucide-react";

const ProductCard = ({ product, onSelect }) => {
  return (
    <div className="card w-96 rounded-xl bg-yellow-100">
      <figure className="px-5 pt-5">
        <img className="rounded-xl" src={product.imageUrl} alt={product.name} />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold ">{product.name}</h2>
        <div className="badge badge-outline rounded-xl border-0 bg-zeta-main-lighter  text-zeta-main">
          {product.team}
        </div>
        <p>{product.description}</p>
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span>{product.quantity}</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="">Price</span>
              <span className="text-zeta-main">
                {product.price.toLocaleString()}
                {/* convert number to string with format */}
              </span>
            </div>
          </div>

          <button
            onClick={onSelect}
            className="btn w-full bg-zeta-main text-white rounded-4xl "
          >
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
