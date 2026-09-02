import { ShoppingCart } from "lucide-react";

const ProductCard = () => {
  return (
    <div className="card w-96 rounded-xl bg-yellow-200">
      <figure className="px-5 pt-5">
        <img
          className="rounded-xl"
          src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/2e9b3d1665f944f09c921c0174b355bf_9366/Liverpool_25-26_JV6423_21_model.jpg"
          alt="Liverpool Jersey"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">
          Liverpool FC 26/27 Home Jersey
        </h2>
        <div className="badge badge-outline rounded-xl border-0 bg-zeta-main-lighter  text-zeta-main">
          Liverpool
        </div>
        <p>
          jersey with Climacool technology for faster sweat release and cooling
          ...
        </p>
        <div>
          <div className="flex justify-between">
            <span>Quantity</span>
            <span>42 items</span>
          </div>
          <div className="flex justify-between">
            <span>Price</span>
            <span>2,900</span>
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
