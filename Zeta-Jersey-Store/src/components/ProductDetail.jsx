import { useState } from "react";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { products } = useCart();
  const product = products[0];

  const [selectedImg, setSelectedImg] = useState(
    product?.images?.[0] || product?.imageUrl,
  );

  return (
    <div className="p-6">
      <div className="flex gap-2">
        <div className="flex flex-col gap-3">
          {product?.images?.map((imgUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedImg(imgUrl)}
              className={`w-20 h-20 rounded-xl overflow-hidden ${
                selectedImg === imgUrl // condition
                  ? "ring-2 ring-zeta-sub" // if truly
                  : "opacity-70 hover:opacity-100" // if falsy
              }`}
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
            src={selectedImg}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
