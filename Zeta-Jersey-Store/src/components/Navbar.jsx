import logo from "../assets/logo/Zeta_all_Green_Logo.png";
import { Heart, ShoppingCart, CircleUser } from "lucide-react";

const Navbar = () => {
  return (
    <>
      <nav className="sticky top-4 z-50 mt-4 mx-4 max-w-6xl h-15 flex items-center justify-between px-6 py-2 bg-[#2F2F2F]/85 backdrop:blur-lg rounded-full shadow-lg">
        {/* left: Logo */}
        <div className="flex items-center h-15">
          <a href="#">
            <img
              className="h-20 w-auto -my-5 object-contain scale-250"
              src={logo}
              alt="all-green-logo"
            />
          </a>
        </div>

        {/* center */}
        <div className="p-2 flex items-center h-9 bg-[#D3D648]/36 backdrop-blur-lg rounded-full text-white text-base shadow-sm">
          <a href="#" className="px-4 hover:text-[#1E0E8A]">
            New Arrivals
          </a>
          <a href="#" className="px-4 hover:text-[#1E0E8A]">
            Best Seller
          </a>
          <a href="#" className="px-3.5 hover:text-[#1E0E8A]">
            League
          </a>
          <a href="#" className="px-4 hover:text-[#1E0E8A]">
            Collections
          </a>
          <a href="#" className="px-4 hover:text-[#1E0E8A]">
            On Sale
          </a>
        </div>

        {/* right: search & action icons */}
        <div class="flex items-center space-x-4 h-10">
          {/* Search Bar: DaisyUI */}
          <label className="input rounded-full bg-[#D3D648]/30 border border-white/20 h-9 w-48 text-white flex items-center gap-2 px-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/30">
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

          {/* Icons: Wishlist, Cart, Profile */}
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

      {/* <main class="max-w-7xl mx-auto px-8 space-y-10 py-12">
        <section>
          <h2 class="text-3xl text-[#FAFAFC] font-bold tracking-tight mb-6">
            New Arrivals
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/a974a5480a4e44a7a24ec37f6a9d2b87_9366/Real_Madrid_26-27_Away_Authentic_Jersey_Green_JZ7219_HM51.jpg"
                  alt="Real Madrid 26/27 Away Authentic Jersey"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    Real Madrid 26/27 Away Authentic Jersey
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Madrid
                    </span>
                    <span class="px-2 py-0.5 bg-[#D3D648]/40 text-gray-800 text-[11px] font-medium rounded-md">
                      New
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Shirt featuring Climacool technology for wicking and
                    dispersing sweat.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">9 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿4,600
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>

            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/5f97bc7a2c614f3090ab3733a74645cd_9366/Liverpool_FC_26-27_Away_Jersey_Authentic_White_KA6859_HM51.jpg"
                  alt="Liverpool FC 26/27 Away Jersey Authentic"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    Liverpool FC 26/27 Away Jersey Authentic
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Liverpool
                    </span>
                    <span class="px-2 py-0.5 bg-[#D3D648]/40 text-gray-800 text-[11px] font-medium rounded-md">
                      New
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Jersey with Climacool+ materials for a cool, dry and
                    distraction free performance.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">9 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿4,600
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke-Width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>

            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/dc9b78a2955f4edf9dc43b854e0b55ed_9366/Manchester_United_26-27_Third_Jersey_Authentic_Beige_KA6875_HM51.jpg"
                  alt="Manchester United 26/27 Third Jersey Authentic"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    Manchester United 26/27 Third Jersey Authentic
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Manchester
                    </span>
                    <span class="px-2 py-0.5 bg-[#D3D648]/40 text-gray-800 text-[11px] font-medium rounded-md">
                      New
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Football shirt with Climacool+ technology for a
                    distraction-free performance.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">9 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿4,600
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 class="text-3xl text-[#FAFAFC] font-bold tracking-tight mb-6">
            Best Seller
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/459c2593ec9d4745a240a1949dac8041_9366/Liverpool_FC_26-27_Home_Jersey_Burgundy_KA6852_41_detail.jpg"
                  alt="Liverpool FC 26/27 Home Jersey"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    Liverpool FC 26/27 Home Jersey
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Liverpool
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Jersey with Climacool technology for faster sweat release
                    and cooling comfort.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">42 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿2,900
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>

            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d2c66cccdef74bfcb75edbbcf6ee981b_faec/FC_Bayern_26-27_Away_Authentic_Jersey_White_JZ3068_HM3.tiff.jpg"
                  alt="Real Madrid 26/27 Away Authentic Jersey"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    FC Bayern 26/27 Away Authentic Jersey
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Madrid
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Football shirt with tonal graphic details, so you can show
                    off your team spirit.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">9 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿4,600
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>

            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/aaf7656557714bfa8ae493230319243f_9366/Real_Madrid_26-27_Home_Jersey_White_JZ7206_41_detail.jpg"
                  alt="Real Madrid 26/27 Home Jersey"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    Real Madrid 26/27 Home Jersey
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Madrid
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Shirt featuring Climacool technology for wicking and
                    dispersing sweat.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">42 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿2,900
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>

            <article class="rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition group">
              <div class="h-48 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/673b82c4b96d4f5c96c8a85e023f84a8_9366/Manchester_United_26-27_Home_Jersey_Authentic_Red_KA6868_HM51.jpg"
                  alt="Manchester United 26/27 Home Jersey Authentic"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  class="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-sm transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900 leading-snug hover:text-[#1E0E8A] transition-colors">
                    Manchester United 26/27 Home Jersey Authentic
                  </h3>

                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 bg-[#1E0E8A]/10 text-[#1E0E8A] text-[11px] font-medium rounded-md">
                      Manchester United
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 mt-5 leading-relaxed">
                    Slim-fit jersey with Climacool+ technology for effective
                    cooling on the pitch.
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-100 space-y-2.5">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-gray-400">Quantity</span>
                    <span class="text-xs text-gray-400">42 items</span>
                  </div>

                  <div class="flex items-baseline justify-between">
                    <span class="text-base text-gray-700 font-medium">
                      Price
                    </span>
                    <span class="text-base font-bold text-[#1E0E8A]">
                      ฿4,600
                    </span>
                  </div>

                  <button class="w-full py-2 px-3 bg-[#1E0E8A] text-white text-xs md:text-sm font-semibold rounded-full hover:bg-[#150a61] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 class="text-3xl text-[#FAFAFC] font-bold tracking-tight mb-6">
            Shop by League
          </h2>
          <div class="relative flex items-center">
            <button class="absolute -left-4 z-10 w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center shadow hover:bg-gray-100">
              ❮
            </button>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-2">
              <a
                href="#"
                class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
              >
                <img
                  src="https://s.yimg.com/lo/mysterio/api/3aca8cc4f6d96c273f4c4937c232083d3b14ee7b5fd2e4dd34005dc8a7cf50ee/lightyear_networkapi/resizefill_w960%3Bquality_80%3Bformat_webp/https%3A%2F%2Fmedia.zenfs.com%2Fen%2Fthe_football_faithful_articles_458%2F8272d1245b72b55420f0911736e58059"
                  alt="Premier League"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />
                <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
                <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-2">
                  <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                    League
                  </span>
                  <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                    Premier League
                  </h3>
                </div>
              </a>

              <a
                href="#"
                class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8Ztap1ynqb07jQFqUKJew5FZp_J-HuvkZMu7mxGnxNVGis9hnrKtEdE8&s=10"
                  alt="La Liga"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />
                <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
                <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
                  <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                    League
                  </span>
                  <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                    La Liga
                  </h3>
                </div>
              </a>

              <a
                href="#"
                class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
              >
                <img
                  src="https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F07%2Fnike-inter-milan-serie-a-2022-23-home-kit-4.jpg?q=90&w=800&cbr=1&fit=max"
                  alt="Serie A"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />
                <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
                <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
                  <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                    League
                  </span>
                  <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                    Serie A
                  </h3>
                </div>
              </a>

              <a
                href="#"
                class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
              >
                <img
                  src="https://preview.redd.it/fc-bayern-25-26-ucl-jersey-v0-clb17cc72kgf1.jpg?width=1080&crop=smart&auto=webp&s=a421cb15d430f73c327e3e50843a96e3c0994edf"
                  alt="Bundesliga"
                  class="absolute inset-0 w-full h-full z-0 object-cover group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />
                <div class="absolute inset-0  from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
                <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
                  <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                    League
                  </span>
                  <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                    Bundesliga
                  </h3>
                </div>
              </a>
            </div>

            <button class="absolute -right-4 z-10 w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center shadow hover:bg-gray-100">
              ❯
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-3xl text-[#FAFAFC] font-bold tracking-tight mb-6">
            Collections
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div class="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-8 group cursor-pointer">
              <img
                src="https://i.pinimg.com/736x/fa/82/d6/fa82d62965395f81bfec38c968f0f260.jpg"
                alt="Special Away Jersey Collection"
                class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div class="absolute inset-0 from-black/85 via-black/30 to-transparent z-10"></div>

              <div class="relative z-20 flex items-end justify-between gap-4 w-full">
                <h3 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FAFAFC] uppercase tracking-tight max-w-xs drop-shadow-md leading-tight">
                  A Special Away Jersey For Every Nation
                </h3>
                <a
                  href="#"
                  class="px-5 py-2.5 bg-[#D3D648]/95 hover:bg-gray-100 text-black font-semibold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  View Collection
                </a>
              </div>
            </div>

            <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div class="sm:col-span-7 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex items-end p-6 group cursor-pointer">
                <img
                  src="https://i.pinimg.com/736x/46/95/19/46951998341ad8e1a6f300ccbe0298b5.jpg"
                  alt="Green Jersey Collection"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div class="absolute inset-0  from-black/60 via-transparent to-transparent z-10"></div>
                <a
                  href="#"
                  class="relative z-20 ml-auto px-4 py-2 bg-[#D3D648]/95 hover:bg-gray-100 text-black font-semibold text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  View Collection
                </a>
              </div>

              <div class="sm:col-span-5 bg-[#1E0E8A] rounded-3xl p-6 lg:p-7 flex flex-col justify-center shadow-sm">
                <h3 class="text-lg lg:text-xl font-bold text-white uppercase tracking-tight mb-3 leading-snug">
                  Champions League Jersey Collection
                </h3>
                <p class="text-xs text-[#D3D648] leading-relaxed">
                  Explore our Champions League Jersey Edition now available in
                  store.
                </p>
              </div>

              <div class="sm:col-span-5 bg-[#1E0E8A] rounded-3xl p-6 lg:p-7 flex flex-col justify-center shadow-sm">
                <h3 class="text-lg lg:text-xl font-extrabold text-white uppercase tracking-tight mb-3 leading-snug">
                  Explore Jerseys From Every Team, Across Every League
                </h3>
                <p class="text-xs text-[#D3D648] leading-relaxed">
                  From every league, every club. Find the one that represents
                  you.
                </p>
              </div>

              <div class="sm:col-span-7 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex items-end p-6 group cursor-pointer">
                <img
                  src="https://i.pinimg.com/736x/9c/33/a9/9c33a9c2b5b9d13e95c1f3c3ae0eec77.jpg"
                  alt="Retro Jersey Collection"
                  class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div class="absolute inset-0 from-black/60 via-transparent to-transparent z-10"></div>
                <a
                  href="#"
                  class="relative z-20 ml-auto px-4 py-2 bg-[#D3D648]/95 hover:bg-gray-100 text-black font-semibold text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  View Collection
                </a>
              </div>
            </div>
          </div>
        </section>
      </main> */}
    </>
  );
};

export default Navbar;
