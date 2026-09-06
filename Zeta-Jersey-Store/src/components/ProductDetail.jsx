import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { products } = useCart();
  const product = products[0];
  return (
    <div className="p-6">
      <div className="flex gap-2">
        <div className="flex flex-col gap-3">
          {product?.images?.map((imgUrl, index) => (
            <button
              key={index}
              className="w-20 h-20 rounded-xl overflow-hidden  "
            >
              <img
                src={imgUrl}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        <div className="w-[450px] h-[550px] rounded-3xl overflow-hidden">
          <img
            src={product?.imageUrl}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
