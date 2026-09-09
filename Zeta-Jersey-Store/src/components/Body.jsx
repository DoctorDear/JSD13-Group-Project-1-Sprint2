import { useState } from "react";
import ProductSection from "./ProductSection.jsx";
import ProfileCategories from "./ProfileCategories.jsx";
import ProfileHero from "./ProfileHero.jsx";
import ReviewsAndStats from "./ReviewsAndStats.jsx";
import Sidebar from "./Sidebar.jsx";

function Body() {
  const [activeMenu, setActiveMenu] = useState("สินค้า");
  const [activeProductTab, setActiveProductTab] = useState("สินค้าขายดี");
  const [likedProducts, setLikedProducts] = useState([]);

  const toggleLike = (index) => {
    setLikedProducts((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#18251e]">
      <div className="mx-auto flex max-w-7xl">
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        <section className="min-w-0 flex-1">
          <div className="px-5 py-6 sm:px-10 sm:py-9">
            <ProfileHero />
            <ProfileCategories />
            <ReviewsAndStats />
            <ProductSection
              activeProductTab={activeProductTab}
              onProductTabChange={setActiveProductTab}
              likedProducts={likedProducts}
              onToggleLike={toggleLike}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default Body;
