import { useState } from "react";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { products } = useCart();
  const product = products[0];

  const [selectedImg, setSelectedImg] = useState(
    product?.images?.[0] || product?.imageUrl,
  );

  const [selectedEdition, setSelectedEdition] = useState(
    product?.editions?.[0]?.id || "stadium",
  );

  const currentEdition = product?.editions?.find(
    (e) => e.id === selectedEdition,
  );

  

  return (
    <div className="flex p-6">
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
      <div className="flex flex-col gap-4 pt-3 pl-6">
        <div className="badge rounded-xl border-0 bg-zeta-sub font-medium text-zeta-main ">
          {product?.tag}
        </div>
        <div className="pt-3 pb-3">
          <h1 className="text-4xl font-bold text-zeta-main">{product?.name}</h1>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-zeta-main font-bold text-2xl">
            <span className="text-m font-medium mr-0.5">฿</span>
            {product.price.toLocaleString()}
          </div>
          {product.originalPrice && (
            <div className="line-through text-zeta-muted font-normal text-lg">
              <span>฿</span>
              {product.originalPrice.toLocaleString()}
            </div>
          )}
          {product.discount && (
            <span className="badge bg-zeta-main text-white font-semibold rounded-md ">
              {product.discount}
            </span>
          )}
        </div>
        <div className="w-[280px]">{product.description}</div>
        <div className="border border-zeta-muted w-full my-1"></div>
        <div>
          <span>Select Edition</span>
          <div>
            {product?.editions?.map((edition) => (
              <button
                key={edition.id}
                onClick={() => setSelectedEdition(edition.id)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
