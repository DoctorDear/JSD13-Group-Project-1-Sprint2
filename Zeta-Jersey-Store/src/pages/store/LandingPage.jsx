import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import PromoBar from "../../components/layout/PromoBar";
import ProductCard from "../../components/catalog/ProductCard";
import HeroSection from "../../components/catalog/HeroSection";
import { EUROPEAN_LEAGUES, THAI_LEAGUES, filterProductsByLeagues } from "../../lib/catalog/landingCatalog";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const LeagueCard = lazy(() => import("../../components/catalog/LeagueCard"));
const Collections = lazy(() => import("../../components/catalog/Collections"));
const Footer = lazy(() => import("../../components/layout/Footer"));
import { API_BASE_URL } from "../../lib/api/api.js";
import {
  COLD_START_SLOW_NOTICE_DELAY_MS,
  fetchJsonWithRetry,
  getColdStartErrorMessage,
  getLoadingStatusMessage,
  isAbortError,
} from "../../lib/api/coldStartRetry.js";

const productSections = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    query: "sort=newest&limit=50",
  },
  {
    id: "best-seller",
    title: "Best Seller",
    query: "sort=best-selling&limit=8",
  },
];

const ProductSection = ({
  id,
  title,
  products,
  error,
  loading,
  loadingMessage,
  onRetry,
}) => {
  const productsRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    activeIndex: 0,
    itemCount: 0,
  });

  useEffect(() => {
    const productsElement = productsRef.current;
    if (!productsElement) return undefined;

    const updateScrollState = () => {
      const items = Array.from(productsElement.children);
      const canScrollLeft = productsElement.scrollLeft > 0;
      const canScrollRight =
        Math.ceil(productsElement.scrollLeft + productsElement.clientWidth) <
        productsElement.scrollWidth;
      const activeIndex = items.reduce(
        (closestIndex, item, index) =>
          Math.abs(item.offsetLeft - productsElement.scrollLeft) <
          Math.abs(
            items[closestIndex]?.offsetLeft - productsElement.scrollLeft,
          )
            ? index
            : closestIndex,
        0,
      );

      setScrollState({
        canScrollLeft,
        canScrollRight,
        activeIndex,
        itemCount: items.length,
      });
    };

    let rafId = null;
    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateScrollState();
      });
    };

    updateScrollState();
    productsElement.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      productsElement.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [products]);

  const scrollProducts = (direction) => {
    productsRef.current?.scrollBy({
      left: direction * productsRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const scrollToProduct = (index) => {
    const product = productsRef.current?.children[index];
    if (!product) return;

    productsRef.current.scrollTo({
      left: product.offsetLeft,
      behavior: "smooth",
    });
  };

  const hasOverflow =
    scrollState.canScrollLeft || scrollState.canScrollRight;

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 scroll-mt-28">
      <h2 className="mt-6 text-3xl text-black font-bold">{title}</h2>

      {loading ? (
        <div role="status" aria-label={`Loading ${title}`} className="py-4">
          <div className="flex items-center gap-2 pb-2 text-sm text-zeta-muted">
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-sm text-zeta-main"
            />
            <span>{loadingMessage}</span>
          </div>
          <div className="flex gap-2 overflow-hidden">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                aria-hidden="true"
                className="w-[290px] shrink-0 space-y-4 p-5 motion-safe:animate-pulse"
              >
                <div className="aspect-square rounded-xl bg-zeta-main-lighter" />
                <div className="h-5 w-3/4 rounded bg-zeta-main-lighter" />
                <div className="h-5 w-1/2 rounded bg-zeta-main-lighter" />
                <div className="h-32 rounded bg-zeta-main-lighter" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 py-10 text-center"
        >
          <p className="text-zeta-muted">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-zeta-main px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#241878]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="relative py-4">
          {hasOverflow && (
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scrollProducts(-1)}
              disabled={!scrollState.canScrollLeft}
              className="btn btn-circle absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border border-base-300 bg-white shadow-md disabled:opacity-30"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            ref={productsRef}
            className={`flex flex-nowrap gap-2 overflow-x-auto scroll-smooth px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${hasOverflow ? "justify-start" : "justify-center"}`}
          >
            {products?.map((item) => (
              <ProductCard key={item._id || item.id} product={item} />
            ))}
          </div>

          {hasOverflow && (
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scrollProducts(1)}
              disabled={!scrollState.canScrollRight}
              className="btn btn-circle absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 border border-base-300 bg-white shadow-md disabled:opacity-30"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {hasOverflow && (
            <div
              className="mt-2 flex justify-center gap-2"
              role="tablist"
              aria-label={`${title} carousel pages`}
            >
              {Array.from({ length: scrollState.itemCount }).map((_, index) => (
                <button
                  key={`${id}-dot-${index}`}
                  type="button"
                  role="tab"
                  aria-label={`Go to ${title} item ${index + 1}`}
                  aria-selected={scrollState.activeIndex === index}
                  onClick={() => scrollToProduct(index)}
                  className={`h-2 rounded-full transition-all ${
                    scrollState.activeIndex === index
                      ? "w-7 bg-black"
                      : "w-2 bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const LandingPage = () => {
  const [productsBySection, setProductsBySection] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryAttempt(0);
    setIsWakingUp(false);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => {
      if (!controller.signal.aborted) {
        setIsWakingUp(true);
      }
    }, COLD_START_SLOW_NOTICE_DELAY_MS);

    const fetchProducts = async () => {
      try {
        const sectionResults = await Promise.all(
          productSections.map(async ({ id, query }) => {
            const data = await fetchJsonWithRetry(
              `${API_BASE_URL}/products?${query}`,
              {
                signal: controller.signal,
                errorMessage: `Unable to load ${id} products`,
                onRetry: ({ attempt }) => {
                  if (!controller.signal.aborted) {
                    setIsWakingUp(true);
                    setRetryAttempt((prev) => Math.max(prev, attempt));
                  }
                },
              },
            );

            return [id, data];
          }),
        );

        if (controller.signal.aborted) return;
        setProductsBySection(Object.fromEntries(sectionResults));
        setError(null);
        setLoading(false);
        setRetryAttempt(0);
        setIsWakingUp(false);
      } catch (err) {
        if (!controller.signal.aborted && !isAbortError(err)) {
          setError(
            getColdStartErrorMessage(
              err,
              "Unable to load products right now. Please try again.",
            ),
          );
          setLoading(false);
          setIsWakingUp(false);
        }
      } finally {
        clearTimeout(slowTimer);
      }
    };

    fetchProducts();

    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [reloadKey]);

  const loadingMessage = getLoadingStatusMessage({
    isWakingUp,
    retryAttempt,
    defaultMessage: "Loading products...",
  });

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, []);

  const europeanArrivals = useMemo(
    () =>
      filterProductsByLeagues(
        productsBySection["new-arrivals"] || [],
        EUROPEAN_LEAGUES,
      ).slice(0, 8),
    [productsBySection],
  );

  const thaiLeagueArrivals = useMemo(
    () =>
      filterProductsByLeagues(
        productsBySection["new-arrivals"] || [],
        THAI_LEAGUES,
      ).slice(0, 8),
    [productsBySection],
  );

  return (
    <div>
      <Navbar page="home" />

      <main>
        <div className="-mt-24">
          <HeroSection className="relative w-full min-h-[500px]" />
        </div>

        <div>
          <PromoBar />
        </div>

        {productSections.map(({ id, title }) => (
          <ProductSection
            key={id}
            id={id}
            title={title}
            products={id === "new-arrivals" ? europeanArrivals : productsBySection[id]}
            error={error}
            loading={loading}
            loadingMessage={loadingMessage}
            onRetry={handleRetry}
          />
        ))}

        <Suspense fallback={null}>
          <LeagueCard />
          <Collections />
        </Suspense>
        <ProductSection
          id="thai-league-arrivals"
          title="Thai League"
          products={thaiLeagueArrivals}
          error={error}
          loading={loading}
          loadingMessage={loadingMessage}
          onRetry={handleRetry}
        />
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;
