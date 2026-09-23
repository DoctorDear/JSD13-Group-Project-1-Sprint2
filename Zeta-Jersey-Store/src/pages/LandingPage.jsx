import Navbar from "../components/Navbar";
import PromoBar from "../components/PromoBar";
import ProductCard from "../components/ProductCard";
import LeagueCard from "../components/LeagueCard";
import Collections from "../components/Collections";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import productData from "../data/products.json";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const localImportedDemo = productData.filter((product) =>
  product.id?.startsWith("demo-pl-") || product.id?.startsWith("demo-nike-") || product.id?.startsWith("demo-puma-") || product.id?.startsWith("demo-thai-"),
);
const localDemoBySku = new Map(localImportedDemo.map((product) => [product.sku, product]));

const productSections = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    query: "sort=newest&limit=8",
  },
  {
    id: "best-seller",
    title: "Best Seller",
    query: "sort=best-selling&limit=8",
  },
];

const ProductSection = ({ id, title, products, error }) => {
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
    <section id={id} className="mx-auto max-w-7xl px-4">
      <h2 className="mt-6 text-3xl text-black font-bold">{title}</h2>

      {error ? (
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
              `${API_URL}/api/v1/products?${query}`,
              { signal: controller.signal },
            );

            if (!response.ok) {
              throw new Error(`Unable to load ${id} products`);
            }

            return [id, await response.json()];
          }),
        );

        const sections = Object.fromEntries(sectionResults);
        const remoteNewArrivals = sections["new-arrivals"];
        const remoteSkus = new Set(remoteNewArrivals.map((product) => product.sku));
        sections["new-arrivals"] = [
          ...localImportedDemo.filter((product) => !remoteSkus.has(product.sku)).reverse(),
          ...remoteNewArrivals.map((product) => {
            const local = localDemoBySku.get(product.sku);
            return local ? { ...product, imageUrl: local.imageUrl, images: local.images } : product;
          }),
        ].slice(0, 8);
        setProductsBySection(sections);
      } catch (err) {
        if (err.name !== "AbortError") {
          setProductsBySection({ "new-arrivals": [...localImportedDemo].reverse().slice(0, 8) });
          setError(null);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
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
          products={productsBySection[id]}
          error={id === "new-arrivals" && productsBySection[id]?.length ? null : error}
        />
      ))}

      <LeagueCard />
      <Collections />

      <Footer />
    </div>
  );
};

export default LandingPage;
