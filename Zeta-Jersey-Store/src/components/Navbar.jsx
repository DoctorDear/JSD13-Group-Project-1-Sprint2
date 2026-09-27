import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo/Zeta_Green_and_Jersey_Logo.png";
import { Heart, ShoppingCart, ArrowRight, Menu, Search, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cartService } from "../services/cart.js";
import { useAuth } from "../contexts/authContext.js";
import UserMenu from "./UserMenu.jsx";
import GuestUserMenu from "./GuestUserMenu.jsx";
import CartHoverMenu from "./CartHoverMenu.jsx";
import productData from "../data/products.json";
import { api } from "../lib/api.js";

function ProductSearch({ isHome, location, navigate, mobile = false }) {
  const [searchInput, setSearchInput] = useState(() =>
    location.pathname === "/products" ? new URLSearchParams(location.search).get("search") || "" : ""
  );
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  // Live autocomplete search with debounce (~220ms)
  useEffect(() => {
    const query = searchInput.trim();
    if (!query) {
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=3`);
        const items = Array.isArray(res) ? res : res?.products || res?.data || [];
        if (active) {
          if (items.length > 0) {
            setSuggestions(items.slice(0, 3));
          } else {
            // Local fallback filter if API returns empty
            const lower = query.toLowerCase();
            const localMatches = (productData || []).filter((p) =>
              p.name?.toLowerCase().includes(lower) ||
              p.team?.toLowerCase().includes(lower) ||
              (Array.isArray(p.tag)
                ? p.tag.some((t) => t.toLowerCase().includes(lower))
                : typeof p.tag === "string" && p.tag.toLowerCase().includes(lower)) ||
              p.description?.toLowerCase().includes(lower)
            ).slice(0, 3);
            setSuggestions(localMatches);
          }
          setShowDropdown(true);
        }
      } catch {
        if (active) {
          const lower = query.toLowerCase();
          const localMatches = (productData || []).filter((p) =>
            p.name?.toLowerCase().includes(lower) ||
            p.team?.toLowerCase().includes(lower) ||
            (Array.isArray(p.tag)
              ? p.tag.some((t) => t.toLowerCase().includes(lower))
              : typeof p.tag === "string" && p.tag.toLowerCase().includes(lower)) ||
            p.description?.toLowerCase().includes(lower)
          ).slice(0, 3);
          setSuggestions(localMatches);
          setShowDropdown(true);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchInput]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (event) => {
    if (event) event.preventDefault();
    setShowDropdown(false);
    setIsFocused(false);
    const params = new URLSearchParams(location.pathname === "/products" ? location.search : "");
    const query = searchInput.trim();
    if (query) params.set("search", query);
    else params.delete("search");
    navigate(`/products${params.size ? `?${params}` : ""}`);
  };

  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    setIsFocused(false);
    navigate(`/products/${productId}`);
  };

  const isExpanded = isFocused || searchInput.trim().length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <form
        role="search"
        onSubmit={handleSearch}
        className={`input rounded-full h-10 flex items-center transition-all duration-300 ease-out focus-within:outline-none focus-within:ring-2 ${mobile && !isHome ? "text-zeta-main focus-within:ring-zeta-main/30" : "text-white focus-within:ring-white/40"} ${
          mobile ? "w-full" : isExpanded ? "w-64 sm:w-80 shadow-lg" : "w-40 sm:w-48"
        } ${
          isHome ? "bg-zeta-sub/30 border border-white/20" : mobile ? "bg-zeta-main/5 border border-zeta-main/20" : "bg-[#FFFFFF]/30 border border-white/20"
        }`}
      >
        <button type="submit" aria-label="Search products" className="cursor-pointer p-1">
          <svg className="h-[1.3em] w-[1.3em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.0" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </g>
          </svg>
        </button>
        <input
          type="text"
          aria-label="Search products"
          value={searchInput}
          onFocus={() => {
            setIsFocused(true);
            if (searchInput.trim()) setShowDropdown(true);
          }}
          onChange={(event) => {
            const val = event.target.value;
            setSearchInput(val);
            if (!val.trim()) {
              setSuggestions([]);
              setShowDropdown(false);
            } else if (!showDropdown) {
              setShowDropdown(true);
            }
          }}
          placeholder="Search jerseys..."
          className={`bg-transparent outline-none w-full text-sm pl-1 pr-2 ${mobile && !isHome ? "text-zeta-main placeholder:text-gray-500" : "placeholder:text-white/80 text-white"}`}
        />
        {searchInput.trim() && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className={`text-xs px-2 cursor-pointer ${mobile && !isHome ? "text-zeta-main" : "text-white/70 hover:text-white"}`}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      {/* Autocomplete Suggestions Dropdown: Dark frosted on Home, Crisp White on Blue Nav */}
      {showDropdown && isExpanded && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className={`absolute right-0 top-full mt-2 ${mobile ? "w-full" : "w-72 sm:w-80"} overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isHome
              ? "bg-[#242424]/95 backdrop-blur-xl border border-white/20 text-white"
              : "bg-white border border-gray-100 text-gray-900"
          }`}
        >
          {isLoading ? (
            <div
              className={`py-4 text-center text-xs flex items-center justify-center gap-2 ${
                isHome ? "text-white/70" : "text-gray-500"
              }`}
            >
              <span
                className={`loading loading-spinner loading-xs ${
                  isHome ? "text-zeta-sub" : "text-zeta-main"
                }`}
              ></span>
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div
                className={`px-3.5 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  isHome ? "text-white/50" : "text-gray-400"
                }`}
              >
                Suggested Products
              </div>
              <div
                className={`divide-y ${
                  isHome ? "divide-white/10" : "divide-gray-100"
                }`}
              >
                {suggestions.map((product) => {
                  const id = product._id || product.id;
                  const img = product.images?.[0] || product.image || product.imageUrl || "";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectProduct(id)}
                      className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition cursor-pointer ${
                        isHome ? "hover:bg-white/10" : "hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={product.name}
                        className={`h-11 w-11 flex-shrink-0 rounded-lg border object-cover ${
                          isHome ? "border-white/15 bg-black/20" : "border-gray-100 bg-gray-50"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-bold ${
                            isHome ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {product.name}
                        </p>
                        <p
                          className={`text-[11px] truncate ${
                            isHome ? "text-white/60" : "text-gray-500"
                          }`}
                        >
                          {product.team || product.category || "Jersey"}
                        </p>
                        <p
                          className={`text-xs font-extrabold mt-0.5 ${
                            isHome ? "text-zeta-sub" : "text-zeta-main"
                          }`}
                        >
                          ฿{Number(product.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className={`flex w-full items-center justify-between border-t px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                  isHome
                    ? "border-white/15 bg-white/5 text-zeta-sub hover:bg-white/10"
                    : "border-gray-100 bg-gray-50/70 text-zeta-main hover:bg-gray-100"
                }`}
              >
                <span>View all results for &ldquo;{searchInput.trim()}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className={`text-xs ${isHome ? "text-white/60" : "text-gray-500"}`}>
                No products found for &ldquo;{searchInput.trim()}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Navbar = ({ page = "home", cartCount = 0 }) => {
  const isHome = page === "home";
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, booting } = useAuth();
  const [totalItems, setTotalItems] = useState(cartCount);
  const [cartItems, setCartItems] = useState([]);
  const [cartHoverOpen, setCartHoverOpen] = useState(false);
  const cartTimeoutRef = useRef(null);
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);
  const [mobilePanel, setMobilePanel] = useState(null);
  const activePanel = mobilePanel?.key === location.key ? mobilePanel.panel : null;
  const togglePanel = (panel) => setMobilePanel(activePanel === panel ? null : { key: location.key, panel });

  useEffect(() => {
    if (!activePanel) return;
    const closeOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setMobilePanel(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobilePanel(null);
        hamburgerRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = (event) => { if (event.matches) setMobilePanel(null); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [activePanel]);

  const handleCartMouseEnter = () => {
    if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
    setCartHoverOpen(true);
  };

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setCartHoverOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
    };
  }, []);

  // ซิงค์จำนวนสินค้าและรายการสินค้าจาก cartService
  useEffect(() => {
    if (booting) return;
    const updateCartData = async () => {
      try {
        const { cart = [] } = await cartService.get({ guest: !isAuthenticated });
        setCartItems(cart);
        setTotalItems(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch {
        setCartItems([]);
        setTotalItems(0);
      }
    };

    updateCartData();

    // ฟัง event เผื่อมีการอัปเดตตะกร้าจากแท็บอื่นหรือหน้าอื่น
    window.addEventListener("storage", updateCartData);
    window.addEventListener("cart-updated", updateCartData);
    return () => {
      window.removeEventListener("storage", updateCartData);
      window.removeEventListener("cart-updated", updateCartData);
    };
  }, [cartCount, isAuthenticated, booting]);

  const handleScrollToSection = (sectionId) => (event) => {
    if (isHome) {
      event.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${sectionId}`);
      }
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className={`h-16 sticky z-50 flex items-center justify-between px-3 sm:px-5 xl:px-8 transition-all duration-300 ${
          isHome
            ? "top-4 mt-4 mx-4 max-w-full bg-[#2F2F2F]/80 backdrop-blur-lg rounded-full"
            : "top-0 w-full bg-zeta-main"
        }`}
      >
        <div className="flex min-w-0 items-center gap-1 xl:hidden">
          <button ref={hamburgerRef} type="button" aria-label={activePanel === "menu" ? "Close navigation menu" : "Open navigation menu"} aria-expanded={activePanel === "menu"} aria-controls="mobile-navigation" onClick={() => togglePanel("menu")} className={`flex h-11 w-11 shrink-0 items-center justify-center text-zeta-sub ${isHome ? "rounded-full hover:bg-white/10" : "rounded-full border border-white/30 bg-white/10"}`}>
            {activePanel === "menu" ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" aria-label="Zeta home" className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden sm:w-24"><img src={logo} alt="Zeta" className="h-40 w-40 max-w-none shrink-0 object-contain sm:h-48 sm:w-48" /></Link>
        </div>
        <div className="flex items-center gap-1 text-zeta-sub xl:hidden">
          <button type="button" aria-label={activePanel === "search" ? "Close search" : "Open search"} aria-expanded={activePanel === "search"} aria-controls="mobile-navigation" onClick={() => togglePanel("search")} className={`flex h-11 w-11 items-center justify-center rounded-full ${isHome ? "hover:bg-white/10" : "border border-white/30 bg-white/10"}`}><Search size={24} /></button>
          <Link to="/cart" aria-label={`Cart, ${totalItems} items`} className={`relative flex h-11 w-11 items-center justify-center rounded-full ${isHome ? "hover:bg-white/10" : "border border-white/30 bg-white/10"}`}><ShoppingCart size={24} />{totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">{totalItems}</span>}</Link>
          <div className={`[&_button]:text-zeta-sub ${!isHome ? "rounded-full border border-white/30 bg-white/10" : ""}`}>
            {isAuthenticated ? <UserMenu isHome={isHome} /> : <GuestUserMenu isHome={isHome} />}
          </div>
        </div>
        {activePanel && <div id="mobile-navigation" className={`absolute inset-x-0 top-full mt-2 rounded-2xl border p-4 shadow-xl xl:hidden ${isHome ? "border-white/20 bg-[#242424]/95 text-white backdrop-blur-xl" : "border-gray-200 bg-white text-zeta-main"}`}>
          {activePanel === "search" ? <ProductSearch key={`mobile-${location.key}`} isHome={isHome} location={location} navigate={navigate} mobile /> : <div className="grid gap-1">
            {[
              ["All products", "/products"],
              ["New Arrivals", isHome ? "#new-arrivals" : "/products?sort=newest", "new-arrivals"],
              ["Best Seller", isHome ? "#best-seller" : "/products?sort=best-selling", "best-seller"],
              ["League", isHome ? "#leagues" : "/#leagues", "leagues"],
              ["Collections", isHome ? "#collections" : "/#collections", "collections"],
              ["On Sale", "/products?onSale=true"],
              ["Wishlist", "/profile?tab=favorites"],
            ].map(([label, to, section]) => <Link key={label} to={to} onClick={(event) => { setMobilePanel(null); if (section) handleScrollToSection(section)(event); }} className={`flex min-h-11 items-center justify-between rounded-xl px-3 py-2 font-semibold ${isHome ? "hover:bg-white/10 hover:text-zeta-sub" : "hover:bg-zeta-main/5"}`}>{label}<ArrowRight size={18} aria-hidden="true" /></Link>)}
          </div>}
        </div>}
        {/* left: Logo */}
        <div
          onClick={() => navigate("/")}
          className="hidden items-center cursor-pointer xl:flex"
        >
          <img
            className="h-20 w-auto -my-5 object-contain scale-250"
            src={logo}
            alt="green-jersey-logo"
          />
        </div>

        {/* center: Navigation Links */}
        <div
          className={`hidden xl:flex items-center h-10 rounded-full text-base text-white ${
            isHome ? "bg-zeta-sub/30 border border-white/10" : "bg-[#FFFFFF]/10 border border-white/10"
          }`}
        >
          <Link
            to={isHome ? "#new-arrivals" : "/products?sort=newest"}
            onClick={handleScrollToSection("new-arrivals")}
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
            }`}
          >
            New Arrivals
          </Link>
          <Link
            to={isHome ? "#best-seller" : "/products?sort=best-selling"}
            onClick={handleScrollToSection("best-seller")}
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
            }`}
          >
            Best Seller
          </Link>
          <Link
            to={isHome ? "#leagues" : "/#leagues"}
            onClick={handleScrollToSection("leagues")}
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
            }`}
          >
            League
          </Link>
          <Link
            to={isHome ? "#collections" : "/#collections"}
            onClick={handleScrollToSection("collections")}
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
            }`}
          >
            Collections
          </Link>
          <Link
            to="/products?onSale=true"
            className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
              isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
            }`}
          >
            On Sale
          </Link>
        </div>

        {/* right: search & action icons */}
        <div className="hidden xl:flex items-center space-x-4 h-10">
          {/* Search Bar */}
          <ProductSearch
            key={`${location.pathname}${location.search}`}
            isHome={isHome}
            location={location}
            navigate={navigate}
          />

          {/* Action Icons: Profile, Wishlist, Cart */}
          <div className="flex items-center gap-1.5 text-white">
            {/* Profile Dropdown: UserMenu when logged in, GuestUserMenu when guest */}
            {isAuthenticated ? (
              <UserMenu isHome={isHome} />
            ) : (
              <GuestUserMenu isHome={isHome} />
            )}

            {/* Wishlist */}
            <Link
              to="/profile?tab=favorites"
              aria-label="wishlist"
              className={`p-2 rounded-xl transition cursor-pointer hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.2),inset_1px_1px_1px_rgba(255,255,255,0.2)] ${
                isHome ? "hover:text-zeta-main hover:bg-zeta-sub/25" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
            >
              <Heart className="w-6 h-6" />
            </Link>

            {/* Cart Button with Hover Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <button
                type="button"
                onClick={() => navigate("/cart")}
                aria-label="cart"
                className={`relative p-2 rounded-xl transition cursor-pointer hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.2)] ${
                  isHome ? "hover:text-zeta-main hover:bg-zeta-sub/35" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
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

              {cartHoverOpen && (
                <CartHoverMenu
                  cartItems={cartItems}
                  totalItems={totalItems}
                  isHome={isHome}
                  onNavigateCart={() => {
                    setCartHoverOpen(false);
                    navigate("/cart");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
