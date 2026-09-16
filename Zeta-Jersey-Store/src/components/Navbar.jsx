import logo from "../assets/logo/Zeta_Green_and_Jersey_Logo.png";
import { Heart, ShoppingCart, CircleUser } from "lucide-react";

const Navbar = ({ page = "home" }) => {
  const isHome = page === "home";

  return (
    <>
      <nav
        className={`h-16 sticky z-50 flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${
          isHome
            ? "top-4 mt-4 max-w-full bg-[#2F2F2F]/80 backdrop-blur-lg rounded-full"
            : "top-0 w-full bg-[#1E0E8A]"
        }`}
      >
        {/* left: Logo */}
        <div className="flex items-center">
          <a href="#">
            <img
              className="h-20 w-auto -my-5 object-contain scale-250"
              src={logo}
              alt="green-jersey-logo"
            />
          </a>
        </div>

        {/* center */}
        <div
          className={`flex items-center h-10 rounded-full text-base text-white ${isHome ? "bg-[#D3D648]/30 border border-white/10" : "bg-[#FFFFFF]/10 border border-white/10"}`}
        >
          <a
            href="#"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome
                ? "hover:text-[#1E0E8A] hover:bg-[#D3D648]/20"
                : "hover:text-[#D3D648] hover:bg-[#FFFFFF]/10"
            }`}
          >
            New Arrivals
          </a>
          <a
            href="#"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome
                ? "hover:text-[#1E0E8A] hover:bg-[#D3D648]/20"
                : "hover:text-[#D3D648] hover:bg-[#FFFFFF]/10"
            }`}
          >
            Best Seller
          </a>
          <a
            href="#"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome
                ? "hover:text-[#1E0E8A] hover:bg-[#D3D648]/20"
                : "hover:text-[#D3D648] hover:bg-[#FFFFFF]/10"
            }`}
          >
            League
          </a>
          <a
            href="#"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome
                ? "hover:text-[#1E0E8A] hover:bg-[#D3D648]/20"
                : "hover:text-[#D3D648] hover:bg-[#FFFFFF]/10"
            }`}
          >
            Collections
          </a>
          <a
            href="#"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome
                ? "hover:text-[#1E0E8A] hover:bg-[#D3D648]/20"
                : "hover:text-[#D3D648] hover:bg-[#FFFFFF]/10"
            }`}
          >
            On Sale
          </a>
        </div>

        {/* right: search & action icons */}
        <div className="flex items-center space-x-4 h-10">
          {/* DaisyUI: Search Bar */}
          <label
            className={`input rounded-full h-10 w-40 text-white flex items-center focus-within:outline-none focus-within:ring-1 focus-within:ring-white/30 ${
              isHome
                ? " bg-[#D3D648]/30 border border-white/20"
                : " bg-[#FFFFFF]/30 border border-white/20"
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
              className="placeholder:text-white"
            />
          </label>

          {/* LudiceIcon: Wishlist, Cart, Profile */}
          <div className="flex items-center gap-1.5 text-white">
            <button
              type="button"
              aria-lable="whishlist"
              className="p-2 rounded-xl hover:bg-[#D3D648]/30 transition cursor-pointer"
            >
              <Heart className="w-6 h-6" />
            </button>

            <button
              type="button"
              aria-lable="whishlist"
              className="p-2 rounded-xl hover:bg-[#D3D648]/30 transition cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>

            <button
              type="button"
              aria-lable="whishlist"
              className="p-2 rounded-xl hover:bg-[#D3D648]/30 transition cursor-pointer"
            >
              <CircleUser className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
