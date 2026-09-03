import logo from "../assets/logo/Zeta_all_Green_Logo.png";

const Navbar = () => {
  return (
    <>
      <nav className="sticky top-4 z-50 mt-4 mx-4 max-w-7xl md:mx-auto flex items-center justify-between px-6 py-2 bg-[#2F2F2F]/80 backdrop:blur-lg rounded-full shadow-lg">
        {/* left: Logo */}
        <div className="flex items-center">
          <a href="#">
            <img
              className="h-20 w-auto -my-5 object-contain"
              src={logo}
              alt="all-green-logo"
            />
          </a>
        </div>

        {/* center */}
        <div className="flex items-center h-10 bg-[#D3D648]/36 backdrop-blur-lg rounded-full text-white font-medium shadow-sm">
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            New Arrivals
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            Best Seller
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            League
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            Collections
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            On Sale
          </a>
        </div>

        {/* right: search & action icons */}
        <div class="flex items-center space-x-4 h-10">
          {/* Search Bar */}
          <div class="relative flex items-center">
            <svg
              class="w-4 h-4 text-white z-10 absolute left-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              class="pl-9 pr-4 py-2 w-44 rounded-full bg-[#D3D648]/30 backdrop-blur-sm border border-white/20 text-xs placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Icons: Wishlist, Cart, Profile */}
          <div class="flex items-center space-x-3.5 text-white">
            {/* Heart Icon (Wishlist) */}
            <a
              href="#"
              class="hover:bg-[#D3D648]/30 rounded-xl transition p-1"
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
            </a>

            {/* Cart Icon */}
            <a
              href="#"
              class="hover:bg-[#D3D648]/30 rounded-xl transition p-1"
              aria-label="Cart"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </a>

            {/* User/Profile Icon */}
            <a
              href="#"
              class="hover:bg-[#D3D648]/30 rounded-xl transition p-1"
              aria-label="Profile"
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
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
