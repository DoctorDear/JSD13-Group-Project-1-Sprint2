import Navbar from "./Navbar";
import PromoBar from "./PromoBar";
import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";
import LeagueCard from "./LeagueCard";
import Collections from "./Collections";
import Footer from "./Footer";
import HeroSection from "./HeroSection";

const LandingPage = () => {
  const { products } = useCart();
  return (
    <div>
      <Navbar page="home" />
      <Navbar page="other" />
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
