import { Heart, Ruler, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductLeague } from "../lib/productCatalog";
import { api } from "../lib/api";
import ProductReviewSection from "./ProductReviewSection";
import SizeGuideModal from "./SizeGuideModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const ProductDetail = ({ onAddToCart }) => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/v1/products/${id}`);
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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า (บันทึกลง localStorage ทันทีโดยไม่ต้องเช็ค Login)
  // ฟังก์ชันเพิ่มสินค้าลงตะกร้าแบบเบ็ดเสร็จในตัว (ไม่พึ่งพาฟังก์ชันนอก)
  const handleAddToCart = () => {
    try {
      setAdding(true);

      const rawCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const existingCart = Array.isArray(rawCart) ? rawCart.filter(item => item && typeof item === 'object') : [];

      const currentProductId = product?._id || product?.id;

      const itemIndex = existingCart.findIndex(
        (item) => (item.id === currentProductId) && (item.size === selectedSize)
      );

      if (itemIndex > -1) {
        existingCart[itemIndex].quantity = (existingCart[itemIndex].quantity || 1) + 1;
      } else {
        const newItem = {
          id: currentProductId,
          name: product?.name || "Unknown Product",
          price: product?.price || 0,
          image: product?.images?.[0] || "",
          size: selectedSize || "Free Size",
          quantity: 1,
          edition: product?.edition || "",
        };
        existingCart.push(newItem);
      }

      localStorage.setItem("cartItems", JSON.stringify(existingCart));

      // 🛑 ตัดปัญหาเรื่องฟังก์ชันนอกพัง โดยการบังคับรีโหลดหน้าเว็บเบาๆ หรือยิง Event แจ้ง Navbar ทันที
      window.dispatchEvent(new Event("storage"));

      // ✅ เปลี่ยนจาก alert น่ารำคาญ เป็นการแจ้งเตือนสั้นๆ หรือปล่อยผ่านให้ตะกร้าขยับเลย
      alert("Added to cart successfully!");

    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setAdding(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-100" />
        <div className="space-y-5 py-2">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-100" />
          <div className="h-12 w-4/5 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 w-full animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  if (error || !product)
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 text-center text-red-500">
        {error || "Not found product"}
      </div>
    );

  const currentImg = selectedImg || product?.images?.[0];
  const productLeague = getProductLeague(product);
  const productAttributes = [
    ["Fit", product.fit],
    ["Kit Type", product.kitType],
    ["Activity", product.activity],
  ].filter(([, value]) => value);
  const formatAttribute = (value) =>
    String(value)
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-6 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm text-zeta-muted sm:mb-8">
          <Link to="/" className="transition-colors hover:text-zeta-main">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="break-words text-zeta-main">{product.name}</span>
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-14">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-4">
            <div className="order-2 flex min-w-0 gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible">
              {product?.images?.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImg(imgUrl)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 transition sm:w-full ${currentImg === imgUrl
                    ? "ring-2 ring-zeta-sub"
                    : "opacity-70 hover:opacity-100"
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
            <div className="order-1 aspect-[4/5] w-full min-w-0 overflow-hidden rounded-3xl bg-slate-50 sm:order-2 sm:max-h-[720px]">
              <img
                src={currentImg}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="w-fit max-w-full rounded-xl border-0 bg-zeta-sub px-3 py-1 text-xs font-medium text-zeta-main sm:text-sm">
                {productLeague}
              </div>
              <div>
                {product.brand && (
                  <p className="text-xl font-medium text-zeta-main">
                    {product.brand}
                  </p>
                )}
                <h1 className="mt-1 text-3xl font-bold leading-tight text-zeta-main sm:text-xl lg:text-3xl">
                  {product?.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="text-2xl font-bold text-zeta-main sm:text-3xl">
                  <span className="mr-1 align-baseline font-[Arial] text-[0.9em] font-normal leading-none">
                    ฿
                  </span>
                  {product.price?.toLocaleString()}
                </div>
                {product.originalPrice && (
                  <div className="text-lg font-normal text-zeta-muted line-through">
                    <span>฿</span>
                    {product.originalPrice.toLocaleString()}
                  </div>
                )}
                {product.discount && (
                  <span className="rounded-md bg-zeta-main px-2 py-1 text-xs font-semibold text-white">
                    {product.discount}
                  </span>
                )}
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {product.description}
              </p>
              <div className="h-px w-full bg-slate-200" />

              {variants.length > 0 && (
                <div>
                  <span className="text-base font-semibold">
                    Select Edition
                  </span>
                  <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
                    {variants.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => setProduct(prev => ({ ...prev, ...item }))}
                        className={`rounded-xl border p-3 text-left font-bold transition-all sm:p-4 ${product._id === item._id
                          ? "border-zeta-main bg-zeta-main/10 ring-2 ring-zeta-main"
                          : "border-slate-200 hover:border-zeta-main/50 hover:bg-zeta-main/5"
                          }`}
                      >
                        <div className="text-sm">{item.edition}</div>
                        <div className="pt-1 text-xs font-normal text-zeta-muted">
                          ฿{item.price?.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    Select Size:{" "}
                    <span className="text-zeta-main">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="flex items-center gap-1 text-sm underline underline-offset-4"
                  >
                    <Ruler size={15} />
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {product?.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 rounded-xl border text-sm font-bold transition-all ${selectedSize === size
                        ? "bg-zeta-main text-white"
                        : "border-zeta-muted hover:border-zeta-main/50 hover:bg-zeta-main/10"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex w-full gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn min-h-12 flex-1 rounded-xl bg-zeta-main text-white hover:bg-zeta-main/90 disabled:opacity-60"
                >
                  <ShoppingBag size={19} />
                  <span>{adding ? "Adding..." : "Add to Cart"}</span>
                </button>
                <button
                  className="btn min-h-12 w-12 rounded-xl border border-slate-200 bg-white p-0 text-zeta-main hover:border-zeta-main hover:bg-zeta-main/5"
                  aria-label="Add to wishlist"
                >
                  <Heart size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {productAttributes.length > 0 && (
          <section className="mt-10 grid gap-5 border-y border-slate-200 py-7 sm:grid-cols-3 sm:gap-0 sm:py-8">
            {productAttributes.map(([label, value], index) => (
              <div
                key={label}
                className={`px-1 sm:px-6 ${index > 0 ? "sm:border-l sm:border-slate-200" : ""
                  }`}
              >
                <p className="text-sm text-zeta-muted">{label}</p>
                <p className="mt-1 text-xl font-bold uppercase tracking-[0.12em] text-zeta-main">
                  {formatAttribute(value)}
                </p>
              </div>
            ))}
          </section>
        )}

        <ProductReviewSection productId={product._id || product.id} />
      </div>
      <SizeGuideModal
        product={product}
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </main>
  );
};
export default ProductDetail;