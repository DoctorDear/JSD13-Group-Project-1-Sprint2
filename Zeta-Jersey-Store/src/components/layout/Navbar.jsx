import { useState, useEffect, useRef } from "react";
import logo from "../../assets/logo/Zeta_Green_and_Jersey_Logo.png";
import { Heart, ShoppingCart, ArrowRight, Menu, Search, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext.js";
import { useCart } from "../../contexts/CartContext.jsx";
import UserMenu from "../navigation/UserMenu.jsx";
import GuestUserMenu from "../navigation/GuestUserMenu.jsx";
import CartHoverMenu from "../navigation/CartHoverMenu.jsx";
import ProductSearch from "../navigation/ProductSearch.jsx";
import { getDesktopNavigationItems } from "../../lib/navigation/navigation.js";

const Navbar = ({ page = "home", cartCount }) => {
  const isHome = page === "home";
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartItems, totalItems: contextTotalItems } = useCart();
  const totalItems = typeof cartCount === "number" ? cartCount : contextTotalItems;
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
          {getDesktopNavigationItems(isHome).map(({ label, to, section }) => (
            <Link
              key={label}
              to={to}
              onClick={section ? handleScrollToSection(section) : undefined}
              className={`px-4 py-2 rounded-full transition-all hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.4),inset_1px_1px_1px_rgba(255,255,255,0.4)] ${
                isHome ? "hover:text-zeta-main hover:bg-zeta-sub/20" : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
              }`}
            >
              {label}
            </Link>
          ))}
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
