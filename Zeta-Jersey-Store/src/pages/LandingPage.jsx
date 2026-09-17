import Navbar from "../components/Navbar";
import PromoBar from "../components/PromoBar";
import ProductCard from "../components/ProductCard";
import LeagueCard from "../components/LeagueCard";
import Collections from "../components/Collections";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/v1/products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProduct();
  }, []);

  console.log(products);

  return (
    <div>
      <Navbar page="home" />

      <div className="-mt-24">
        <HeroSection className="realtive w-full min-h-[500px]" />
      </div>

      <div>
        <PromoBar />
      </div>

      {/* New Arrivals */}
      <div>
        <h2 className="px-4 mt-6 text-3xl text-black font-bold">
          New Arrivals
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {products?.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>

      {/* Best Seller */}
      <div>
        <h2 className="px-4 mt-6 text-3xl text-black font-bold">Best Seller</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {products?.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>

      <LeagueCard />
      <Collections />

      <Footer />
    </div>
  );
};

export default LandingPage;
