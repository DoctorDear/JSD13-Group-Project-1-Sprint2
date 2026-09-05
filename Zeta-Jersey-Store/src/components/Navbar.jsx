import logo from "../assets/logo/Zeta_all_Green_Logo.png";
import { Heart, ShoppingCart, CircleUser } from "lucide-react";

const Navbar = () => {
  return (
    <>
      <nav className="sticky top-4 z-50 mt-4 mx-4 max-w-full h-15 flex items-center justify-between px-6 py-2 bg-[#2F2F2F]/75 backdrop-blur-lg rounded-full">
        {/* left: Logo */}
        <div className="flex items-center h-15">
          <a href="#">
            <img
              className="h-20 w-auto -my-5 object-contain scale-230"
              src={logo}
              alt="all-green-logo"
            />
          </a>
        </div>

        {/* center */}
        <div className="flex items-center h-10 rounded-full bg-[#D3D648]/30 border border-white/10 text-white text-base">
          <a
            href="#"
            className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
          >
            New Arrivals
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
          >
            Best Seller
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
          >
            League
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
          >
            Collections
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-full transition-all hover:text-[#1E0E8A] hover:bg-[#D3D648]/20 hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)]"
          >
            On Sale
          </a>
        </div>

        {/* right: search & action icons */}
        <div class="flex items-center space-x-4 h-10">
          {/* DaisyUI: Search Bar */}
          <label className="input rounded-full bg-[#D3D648]/30 border border-white/20 h-9 w-40 text-white flex items-center focus-within:outline-none focus-within:ring-1 focus-within:ring-white/30">
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
          <div class="flex items-center gap-1.5 text-white">
            <button
              type="button"
              aria-lable="whishlist"
              className="p-1 rounded-xl hover:bg-[#D3D648]/30 transition cursor-pointer"
            >
              <Heart className="w-6 h-6" />
            </button>

            <button
              type="button"
              aria-lable="whishlist"
              className="p-1 rounded-xl hover:bg-[#D3D648]/30 transition cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>

            <button
              type="button"
              aria-lable="whishlist"
              className="p-1 rounded-xl hover:bg-[#D3D648]/30 transition cursor-pointer"
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
