import { Heart, ShoppingCart } from "lucide-react";

const ProductCard = ({ product }) => {
  return (
    <div className="card w-96 rounded-xl bg-white-100">
      <figure className="px-5 pt-5 ">
        <img
          className="rounded-xl aspect-square object-cover"
          src={product.imageUrl}
          alt={product.name}
        />
        <span className="badge badge-outline absolute top-7 left-7 rounded-xl border-0 font-medium bg-zeta-sub-lighter text-zeta-sub-dark">
          NEW
        </span>
        <button className="absolute top-7 right-7 bg-white rounded-full p-2 m-1">
          <Heart size={20} />
        </button>
      </figure>
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold ">{product.name}</h2>
        <div className="badge badge-outline rounded-xl border-0 bg-zeta-main-lighter font-medium text-zeta-main">
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
                <span className="text-sm font-medium mr-0.5">฿</span>
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
