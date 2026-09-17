import { Heart, Ruler, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v1/products/${id}`);
        const data = await response.json();
        setProduct(data.product);
        setVariants(data.variants || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const [selectedImg, setSelectedImg] = useState(null);

  const [selectedSize, setSelectedSize] = useState("M");

  if (loading)
    return <div className="p-8 text-center">loading product data...</div>;
  if (error || !product)
    return (
      <div className="p-8 text-center text-red-500">
        {error || "Not found product"}
      </div>
    );

  const currentImg = selectedImg || product?.images?.[0];

  return (
    <div className="flex p-6">
      <div className="flex gap-2">
        <div className="flex flex-col gap-3">
          {product?.images?.map((imgUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedImg(imgUrl)}
              className={`w-20 h-20 rounded-xl overflow-hidden ${
                currentImg === imgUrl // condition
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
        <div className="w-[450px] h-[600px] rounded-3xl overflow-hidden">
          <img
            src={currentImg}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-3 pl-6">
        <div className="badge rounded-xl border-0 bg-zeta-sub font-medium text-zeta-main ">
          {product?.tag}
        </div>
        <div className="pt-2 pb-1">
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
        {variants.length > 0 && (
          <div>
            <span className="font-semibold text-base">Select Edition</span>
            <div className="flex gap-3 pt-2">
              {variants.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setProduct(item)}
                  className={`w-full p-3 rounded-xl border text-left transition-all font-bold ${
                    product._id === item._id
                      ? "border-zeta-main ring-2 ring-zeta-main bg-zeta-main/10"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-sm">{item.edition}</div>
                  <div className="text-xs font-light text-zeta-muted">
                    ฿{item.price?.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center ">
            <span className="font-semibold ">
              Select Size: <span>{selectedSize}</span>
            </span>
            <div className="flex gap-1 items-center">
              <Ruler size={15} />
              <button className="underline">Size Guide</button>
            </div>
          </div>
          <div className="flex gap-2">
            {product?.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-full h-12 border rounded-xl font-bold text-sm transition-all ${selectedSize === size ? "bg-zeta-main text-white " : "border-zeta-muted hover:border-zeta-main/50 hover:bg-zeta-main/10"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div>
          <button className="btn btn-wide bg-zeta-main text-white rounded-xl">
            <ShoppingBag />
            <span>Add to Cart</span>
          </button>
          <button className="btn">
            <Heart />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
