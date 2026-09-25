import { useState, useEffect } from "react";
import logo from "../assets/logo/Zeta_Green_and_Jersey_Logo.png";
import { Heart, ShoppingCart, CircleUser } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../services/cart.js";
import { useAuth } from '../contexts/AuthContext.jsx';

const Navbar = ({ page = "home", cartCount = 0 }) => {
  const isHome = page === "home";
  const navigate = useNavigate();
  const { isAuthenticated, booting } = useAuth();
  const [totalItems, setTotalItems] = useState(cartCount);

  // ซิงค์จำนวนสินค้าจาก localStorage และ props ที่ส่งมา
  useEffect(() => {
    if (booting) return;
    const updateCartCount = async () => {
      try {
        const { cart = [] } = await cartService.get({ guest: !isAuthenticated });
        setTotalItems(cart.reduce((sum, item) => sum + item.quantity, 0));
      } catch {
        setTotalItems(0);
      }
    };

    updateCartCount();

    // ฟัง event เผื่อมีการอัปเดตตะกร้าจากแท็บอื่นหรือหน้าอื่น
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, [cartCount, isAuthenticated, booting]);

  return (
    <>
      <nav
        className={`h-16 sticky z-50 flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${isHome
          ? "top-4 mt-4 mx-4 max-w-full bg-[#2F2F2F]/80 backdrop-blur-lg rounded-full"
          : "top-0 w-full bg-zeta-main"
          }`}
      >
        {/* left: Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer"
        >
          <img
            className="h-20 w-auto -my-5 object-contain scale-250"
            src={logo}
            alt="green-jersey-logo"
          />
        </div>

        {/* center */}
        <div
          className={`flex items-center h-10 rounded-full text-base text-white ${isHome ? "bg-zeta-sub/30 border border-white/10" : "bg-[#FFFFFF]/10 border border-white/10"
            }`}
        >
          <Link
            to={isHome ? "#new-arrivals" : "/products?sort=newest"}
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
          >
            New Arrivals
          </Link>
          <Link
            to={isHome ? "#best-seller" : "/products?sort=best-selling"}
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
          >
            Best Seller
          </Link>
          <Link
            to="/products"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
          >
            League
          </Link>
          <Link
            to="/products"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
          >
            Collections
          </Link>
          <Link
            to="/products?onSale=true"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
          >
            On Sale
          </Link>
        </div>

        {/* right: search & action icons */}
        <div className="flex items-center space-x-4 h-10">
          {/* Search Bar */}
          <label
            className={`input rounded-full h-10 w-40 text-white flex items-center focus-within:outline-none focus-within:ring-1 focus-within:ring-white/30 ${isHome ? "bg-zeta-sub/30 border border-white/20" : "bg-[#FFFFFF]/30 border border-white/20"
              }`}
          >
            <svg
              className="h-[1.5em]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.0"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="text"
              required
              placeholder="Search"
              className="placeholder:text-white bg-transparent outline-none w-full"
            />
          </label>

          {/* Action Icons: Wishlist, Cart, Profile */}
          <div className="flex items-center gap-1.5 text-white">
            <button
              type="button"
              aria-label="wishlist"
              className={`p-2 rounded-xl transition cursor-pointer hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.2),inset_1px_1px_1px_rgba(255,255,255,0.2)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/25" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
                }`}
            >
              <Heart className="w-6 h-6" />
            </button>

            {/* ปุ่มตะกร้าสินค้า - กดแล้วไปหน้า /cart พร้อมแสดง Badge จำนวนสินค้า */}
            <button
              type="button"
              onClick={() => navigate("/cart")}
              aria-label="cart"
              className={`relative p-2 rounded-xl transition cursor-pointer hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.2)] ${isHome ? "hover:text-zeta-main hover:bg-zeta-sub/35" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
                }`}
            >
              <ShoppingCart className="w-6 h-6" />

              {/* Badge สีแดงแสดงจำนวนสินค้า */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              to="/profile"
              aria-label="Profile"
              className={`p-2 rounded-xl transition cursor-pointer hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.2),inset_1px_1px_1px_rgba(255,255,255,0.2)] ${
                isHome
                  ? "hover:text-zeta-main hover:bg-zeta-sub/35"
                  : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
            >
              <CircleUser className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
