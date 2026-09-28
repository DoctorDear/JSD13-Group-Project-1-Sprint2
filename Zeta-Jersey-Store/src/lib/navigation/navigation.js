export function getDesktopNavigationItems(isHome) {
  return [
    { label: "All Products", to: "/products" },
    { label: "New Arrivals", to: isHome ? "#new-arrivals" : "/products?sort=newest", section: "new-arrivals" },
    { label: "Best Seller", to: isHome ? "#best-seller" : "/products?sort=best-selling", section: "best-seller" },
    { label: "League", to: isHome ? "#leagues" : "/#leagues", section: "leagues" },
    { label: "Collections", to: isHome ? "#collections" : "/#collections", section: "collections" },
    { label: "On Sale", to: "/products?onSale=true" },
  ];
}
