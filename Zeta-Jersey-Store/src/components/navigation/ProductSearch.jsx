import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../../lib/api/api.js";

async function searchLocalProducts(query) {
  const { default: productData } = await import("../../data/products.json");
  const lower = query.toLowerCase();
  return (productData || [])
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.team?.toLowerCase().includes(lower) ||
        (Array.isArray(p.tag)
          ? p.tag.some((t) => t.toLowerCase().includes(lower))
          : typeof p.tag === "string" && p.tag.toLowerCase().includes(lower)) ||
        p.description?.toLowerCase().includes(lower),
    )
    .slice(0, 3);
}

/**
 * Autocomplete product search bar used in both desktop and mobile navigation.
 */
export default function ProductSearch({ isHome, location, navigate, mobile = false }) {
  const [searchInput, setSearchInput] = useState(() =>
    location.pathname === "/products" ? new URLSearchParams(location.search).get("search") || "" : "",
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
        if (!active) return;

        if (items.length > 0) {
          setSuggestions(items.slice(0, 3));
        } else {
          const localMatches = await searchLocalProducts(query);
          if (!active) return;
          setSuggestions(localMatches);
        }
        setShowDropdown(true);
      } catch {
        if (!active) return;
        const localMatches = await searchLocalProducts(query);
        if (!active) return;
        setSuggestions(localMatches);
        setShowDropdown(true);
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
