import { RefreshCw, Ruler, ShoppingBag } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getProductLeague } from "../../lib/catalog/productCatalog";
import { api } from "../../lib/api/api.js";
import {
  COLD_START_SLOW_NOTICE_DELAY_MS,
  getColdStartErrorMessage,
  getLoadingStatusMessage,
  isRetryableColdStartError,
  withColdStartRetry,
} from "../../lib/api/coldStartRetry.js";
import { cartService } from "../../services/cart.js";
import { isPersonalizationEligible } from "../../lib/personalization/personalizationPreview.js";
import { useAuth } from '../../contexts/authContext.js';
import ProductReviewComposer from "../reviews/ProductReviewComposer";
import ProductReviewSection from "../reviews/ProductReviewSection";
import SizeGuideModal from "./SizeGuideModal";
import WishlistButton from "../wishlist/WishlistButton.jsx";
import PersonalizationModal from "../personalization/PersonalizationModal.jsx";

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const { isAuthenticated, booting } = useAuth();

  const handleRetry = () => {
    setError(null);
    setCanRetry(false);
    setRetryAttempt(0);
    setIsWakingUp(false);
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => {
      if (!controller.signal.aborted) {
        setIsWakingUp(true);
      }
    }, COLD_START_SLOW_NOTICE_DELAY_MS);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setCanRetry(false);
        setRetryAttempt(0);
        setIsWakingUp(false);
        const data = await withColdStartRetry(
          () => api.get(`/products/${id}`, { signal: controller.signal }),
          {
            signal: controller.signal,
            onRetry: ({ attempt }) => {
              if (!controller.signal.aborted) {
                setIsWakingUp(true);
                setRetryAttempt(attempt);
              }
            },
          },
        );
        if (controller.signal.aborted) return;
        setProduct(
          data.product
            ? { ...data.product, personalizationTemplate: data.personalizationTemplate }
            : null,
        );
        setVariants(data.variants || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          const retryable = isRetryableColdStartError(err);
          setCanRetry(retryable || (err?.status ?? 0) >= 500);
          setError(
            retryable
              ? getColdStartErrorMessage(
                  err,
                  "Unable to load this product right now. Please try again.",
                )
              : err.message || "Product not found",
          );
        }
      } finally {
        clearTimeout(slowTimer);
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsWakingUp(false);
          setRetryAttempt(0);
        }
      }
    };
    if (id) fetchProduct();
    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [id, reloadKey]);

  useLayoutEffect(() => {
    if (loading || !product) return;

    if (location.hash === "#reviews") {
      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [loading, product, location.hash]);

  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleAddToCart = async ({ size = selectedSize, customName = '', customNumber = null, sleeveBadge = 'none' } = {}) => {
    try {
      setAdding(true);
      await cartService.add({ productId: product._id, product, size, quantity: 1, customName, customNumber, sleeveBadge }, { guest: !isAuthenticated });
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new CustomEvent("cart-feedback", { detail: { type: "success", message: "Added to cart successfully.", isHome: location.pathname === "/" } }));
      setIsPersonalizationOpen(false);
      return true;

    } catch (err) {
      console.error("Failed to add to cart:", err);
      window.dispatchEvent(new CustomEvent("cart-feedback", { detail: { type: "error", message: err.message || "Could not add the product to your cart. Please try again.", isHome: location.pathname === "/" } }));
      return false;
    } finally {
      setAdding(false);
    }
  };

  const loadingMessage = getLoadingStatusMessage({
    isWakingUp,
    retryAttempt,
    defaultMessage: "Loading product...",
  });

  if (loading)
    return (
      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div role="status" className="mb-6 flex items-center gap-2 text-sm text-zeta-muted">
          <span
            aria-hidden="true"
            className="loading loading-spinner loading-sm text-zeta-main"
          />
          <span>{loadingMessage}</span>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-100" />
          <div className="space-y-5 py-2">
            <div className="h-6 w-40 animate-pulse rounded-full bg-slate-100" />
            <div className="h-12 w-4/5 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-24 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-28 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  if (error || !product)
    return (
      <div
        role="alert"
        className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 py-12 text-center"
      >
        <p className="text-red-500">{error || "Not found product"}</p>
        {canRetry && (
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-zeta-main px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#241878]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    );

  const currentImg = selectedImg || product?.images?.[0];
  const productLeague = getProductLeague(product);
  const canPersonalize = isPersonalizationEligible(product);
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
                  {Number(product.price ?? 0).toLocaleString()}
                </div>
                {Number(product.originalPrice) > Number(product.price) && (
                  <div className="text-lg font-normal text-zeta-muted line-through">
                    <span>฿</span>
                    {Number(product.originalPrice).toLocaleString()}
                  </div>
                )}
                {Number(product.originalPrice) > Number(product.price) && (
                  <span className="rounded-md bg-zeta-main px-2 py-1 text-xs font-semibold text-white">
                    {product.discount ||
                      `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
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
                        onClick={() =>
                          setProduct((prev) => ({
                            ...prev,
                            ...item,
                            personalizationTemplate: prev?.personalizationTemplate,
                          }))
                        }
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

              <div className="flex w-full flex-wrap gap-3">
                <button
                  onClick={() => handleAddToCart()}
                  disabled={adding || booting}
                  className="btn min-h-12 flex-1 rounded-xl bg-zeta-main text-white hover:bg-zeta-main/90 disabled:opacity-60"
                >
                  <ShoppingBag size={19} />
                  <span>{adding ? "Adding..." : "Add to Cart"}</span>
                </button>
                {canPersonalize && <button
                  type="button"
                  onClick={() => setIsPersonalizationOpen(true)}
                  disabled={adding || booting}
                  className="btn min-h-12 flex-1 rounded-xl border border-zeta-main bg-white px-4 text-zeta-main hover:bg-zeta-main/5 disabled:opacity-60"
                >
                  Customize jersey
                </button>}
                <WishlistButton
                  productId={product._id || product.id}
                  className="btn min-h-12 w-12 rounded-xl border border-slate-200 bg-white p-0 text-zeta-main hover:border-zeta-main hover:bg-zeta-main/5"
                />
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

        <div id="reviews" className="scroll-mt-24">
          <ProductReviewComposer key={product._id || product.id} productId={product._id || product.id} />
          <ProductReviewSection key={product._id || product.id} productId={product._id || product.id} />
        </div>
      </div>
      <SizeGuideModal
        product={product}
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
      {isPersonalizationOpen && canPersonalize && <PersonalizationModal
        product={product}
        initialSize={product.sizes?.includes(selectedSize) ? selectedSize : product.sizes?.[0] || ''}
        adding={adding}
        onClose={() => setIsPersonalizationOpen(false)}
        onAdd={handleAddToCart}
      />}
    </main>
  );
};
export default ProductDetail;
