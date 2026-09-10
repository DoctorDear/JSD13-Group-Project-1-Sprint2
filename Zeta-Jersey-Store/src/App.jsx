import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PromoBar from "./components/PromoBar";
import LeagueCard from "./components/LeagueCard";
import Collections from "./components/Collections";
import ProductDetail from "./components/ProductDetail";
import Suggestion from "./components/Suggestion";
import Subscribe from "./components/Subscribe";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Dev Navigation Bar for testing different pages */}
      <div className="bg-neutral-900 text-white p-2.5 flex justify-center gap-3 text-xs sticky top-0 z-50 shadow-md">
        <button
          onClick={() => setCurrentPage("home")}
          className={`px-3 py-1 rounded transition-colors ${currentPage === "home" ? "bg-indigo-600 font-semibold" : "hover:bg-neutral-750"}`}
        >
          Home Page
        </button>
        <button
          onClick={() => setCurrentPage("cart")}
          className={`px-3 py-1 rounded transition-colors ${currentPage === "cart" ? "bg-indigo-600 font-semibold" : "hover:bg-neutral-750"}`}
        >
          Cart Page
        </button>
        <button
          onClick={() => setCurrentPage("checkout")}
          className={`px-3 py-1 rounded transition-colors ${currentPage === "checkout" ? "bg-indigo-600 font-semibold" : "hover:bg-neutral-750"}`}
        >
          Checkout Page
        </button>
        <button
          onClick={() => setCurrentPage("confirmation")}
          className={`px-3 py-1 rounded transition-colors ${currentPage === "confirmation" ? "bg-indigo-600 font-semibold" : "hover:bg-neutral-750"}`}
        >
          Confirmation Page
        </button>
      </div>

      {/* Pages Content */}
      <main className="flex-1">
        {currentPage === "home" && (
          <div>
            <Navbar page="home" />
            <PromoBar />
            <LeagueCard />
            <Collections />
            <ProductDetail />
            <Suggestion />
            <Subscribe />
            <Footer />
          </div>
        )}

        {currentPage === "cart" && <CartPage />}
        {currentPage === "checkout" && <CheckoutPage />}
        {currentPage === "confirmation" && <OrderConfirmationPage />}
      </main>
    </div>
  );
};

export default App;
