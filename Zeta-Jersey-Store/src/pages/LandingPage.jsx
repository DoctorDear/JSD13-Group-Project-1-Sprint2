import Navbar from "../components/Navbar";
import PromoBar from "../components/PromoBar";
import ProductCard from "../components/ProductCard";
import LeagueCard from "../components/LeagueCard";
import Collections from "../components/Collections";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import { EUROPEAN_LEAGUES, THAI_LEAGUES, filterProductsByLeagues } from "../lib/landingCatalog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

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

const ProductSection = ({ id, title, products, error, loading }) => {
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

    updateScrollState();
    productsElement.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      productsElement.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
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
        <div role="status" aria-label={`Loading ${title}`} className="flex gap-2 overflow-hidden py-4">
          <span className="sr-only">Loading products…</span>
          {[0, 1, 2, 3].map((index) => <div key={index} aria-hidden="true" className="w-[290px] shrink-0 space-y-4 p-5 motion-safe:animate-pulse">
            <div className="aspect-square rounded-xl bg-zeta-main-lighter" />
            <div className="h-5 w-3/4 rounded bg-zeta-main-lighter" />
            <div className="h-5 w-1/2 rounded bg-zeta-main-lighter" />
            <div className="h-32 rounded bg-zeta-main-lighter" />
          </div>)}
        </div>
      ) : error ? (
        <p className="py-10 text-center text-zeta-muted">{error}</p>
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const sectionResults = await Promise.all(
          productSections.map(async ({ id, query }) => {
            const response = await fetch(
              `${API_BASE_URL}/v1/products?${query}`,
              { signal: controller.signal },
            );

            if (!response.ok) {
              throw new Error(`Unable to load ${id} products`);
            }

            return [id, await response.json()];
          }),
        );

        setProductsBySection(Object.fromEntries(sectionResults));
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

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

  return (
    <div>
      <Navbar page="home" />

      <div className="-mt-24">
        <HeroSection className="realtive w-full min-h-[500px]" />
      </div>

      <div>
        <PromoBar />
      </div>

      {productSections.map(({ id, title }) => (
        <ProductSection
          key={id}
          id={id}
          title={title}
          products={id === "new-arrivals"
            ? filterProductsByLeagues(productsBySection[id] || [], EUROPEAN_LEAGUES).slice(0, 8)
            : productsBySection[id]}
          error={error}
          loading={!error && !productsBySection[id]}
        />
      ))}

      <LeagueCard />
      <Collections />
      <ProductSection
        id="thai-league-arrivals"
        title="Thai League"
        products={filterProductsByLeagues(productsBySection["new-arrivals"] || [], THAI_LEAGUES).slice(0, 8)}
        error={error}
        loading={!error && !productsBySection["new-arrivals"]}
      />

      <Footer />
    </div>
  );
};

export default LandingPage;
