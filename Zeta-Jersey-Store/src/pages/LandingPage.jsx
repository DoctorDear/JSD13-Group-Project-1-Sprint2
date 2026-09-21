import Navbar from "../components/Navbar";
import PromoBar from "../components/PromoBar";
import ProductCard from "../components/ProductCard";
import LeagueCard from "../components/LeagueCard";
import Collections from "../components/Collections";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const productSections = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    query: "sort=newest&limit=4",
  },
  {
    id: "best-seller",
    title: "Best Seller",
    query: "sort=best-selling&limit=4",
  },
];

const ProductSection = ({ id, title, products, error }) => {
  const productsRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  useEffect(() => {
    const productsElement = productsRef.current;
    if (!productsElement) return undefined;

    const updateScrollState = () => {
      const canScrollLeft = productsElement.scrollLeft > 0;
      const canScrollRight =
        Math.ceil(productsElement.scrollLeft + productsElement.clientWidth) <
        productsElement.scrollWidth;

      setScrollState({ canScrollLeft, canScrollRight });
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
              className="btn btn-circle absolute left-0 top-1/2 z-10 -translate-y-1/2 border-0 bg-white shadow-md disabled:opacity-30"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            ref={productsRef}
            className={`flex flex-nowrap gap-6 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${hasOverflow ? "justify-start" : "justify-center"}`}
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
              className="btn btn-circle absolute right-0 top-1/2 z-10 -translate-y-1/2 border-0 bg-white shadow-md disabled:opacity-30"
            >
              <ChevronRight size={22} />
            </button>
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

        setProductsBySection(Object.fromEntries(sectionResults));
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
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
          error={error}
        />
      ))}

      <LeagueCard />
      <Collections />

      <Footer />
    </div>
  );
};

export default LandingPage;
