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
        <h2 className="card-title">Liverpool FC 26/27 Home Jersey</h2>
        <div className="badge badge-outline bg-pink-200 outline-pink-400">
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
          <div className="flex justify-center ">
            <button className="btn">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
