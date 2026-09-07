import { Ruler } from "lucide-react";
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
          <span className="font-semibold text-base">Select Edition</span>
          <div className="flex gap-3 pt-2">
            {product?.editions?.map((edition) => (
              <button
                key={edition.id}
                onClick={() => setSelectedEdition(edition.id)}
                className={`p-3 rounded-xl border text-left transition-all font-bold ${selectedEdition === edition.id ? "border-zeta-main ring-2 ring-zeta-main bg-zeta-main/10 " : "border-gray-200"}`}
              >
                <div className="text-sm">{edition.name}</div>
                <div className="text-xs  font-light">{edition.detail}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <span className="font-semibold ">
              Select Size: <span>M</span>
            </span>
            <div className="flex">
              <Ruler />
              <span>Size Guide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
