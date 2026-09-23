import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import productData from "../data/products.json";
import {
  buildProductFilterOptions,
  filterProducts,
  formatProductPrice,
  getProductPriceBounds,
  PRODUCT_PAGE_SIZE,
  sortProducts,
} from "../lib/productCatalog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export default function useProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [team, setTeam] = useState(() => searchParams.get("team") || "");
  const [league, setLeague] = useState(
    () => searchParams.get("league") || searchParams.get("category") || "",
  );
  const [collection, setCollection] = useState(() => searchParams.get("collection") || "");
  const [edition, setEdition] = useState(() => searchParams.get("edition") || "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [availableOnly, setAvailableOnly] = useState(
    () => searchParams.get("available") === "true",
  );
  const [onSale, setOnSale] = useState(() => {
    const value = searchParams.get("onSale");
    return value === "true" ? "yes" : value === "false" ? "no" : value || "";
  });
  const [sort, setSort] = useState(() => searchParams.get("sort") || "featured");
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/products`);
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);

      const payload = await response.json();
      const remoteProducts = Array.isArray(payload)
        ? payload
        : payload.products || payload.data || [];

      if (!Array.isArray(remoteProducts)) {
        throw new Error("Catalog response was not a list");
      }
      setProducts(remoteProducts);
    } catch {
      setProducts(productData);
      setError(
        "The live catalog is unavailable right now. Showing the saved demo catalog instead.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The catalog request is an external synchronization; its state updates happen asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (search.trim()) nextParams.set("search", search.trim());
    if (team) nextParams.set("team", team);
    if (league) nextParams.set("league", league);
    if (collection) nextParams.set("collection", collection);
    if (edition) nextParams.set("edition", edition);
    if (minPrice) nextParams.set("minPrice", minPrice);
    if (maxPrice) nextParams.set("maxPrice", maxPrice);
    if (availableOnly) nextParams.set("available", "true");
    if (onSale) nextParams.set("onSale", onSale);
    if (sort !== "featured") nextParams.set("sort", sort);

    setSearchParams(nextParams, { replace: true });
  }, [
    search,
    team,
    league,
    collection,
    edition,
    minPrice,
    maxPrice,
    availableOnly,
    onSale,
    sort,
    setSearchParams,
  ]);

  const filters = useMemo(
    () => ({
      search,
      team,
      league,
      collection,
      edition,
      minPrice,
      maxPrice,
      availableOnly,
      onSale,
      sort,
    }),
    [
      search,
      team,
      league,
      collection,
      edition,
      minPrice,
      maxPrice,
      availableOnly,
      onSale,
      sort,
    ],
  );

  const filterOptions = useMemo(() => buildProductFilterOptions(products), [products]);
  const priceBounds = useMemo(() => getProductPriceBounds(products), [products]);
  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters],
  );
  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort],
  );
  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / PRODUCT_PAGE_SIZE));
  const visibleProducts = sortedProducts.slice(
    (page - 1) * PRODUCT_PAGE_SIZE,
    page * PRODUCT_PAGE_SIZE,
  );

  const updateFilter = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  const actions = {
    search: updateFilter(setSearch),
    team: updateFilter(setTeam),
    league: updateFilter(setLeague),
    collection: updateFilter(setCollection),
    edition: updateFilter(setEdition),
    minPrice: updateFilter(setMinPrice),
    maxPrice: updateFilter(setMaxPrice),
    availableOnly: updateFilter(setAvailableOnly),
    onSale: updateFilter(setOnSale),
    sort: updateFilter(setSort),
  };

  const clearFilters = () => {
    setPage(1);
    setSearch("");
    setTeam("");
    setLeague("");
    setCollection("");
    setEdition("");
    setMinPrice("");
    setMaxPrice("");
    setAvailableOnly(false);
    setOnSale("");
    setSort("featured");
  };

  const activeFilters = [
    search && { label: `Search: ${search}`, clear: () => actions.search("") },
    team && { label: team, clear: () => actions.team("") },
    league && { label: league, clear: () => actions.league("") },
    collection && { label: collection, clear: () => actions.collection("") },
    edition && { label: edition, clear: () => actions.edition("") },
    minPrice && {
      label: `From ${formatProductPrice(minPrice)}`,
      clear: () => actions.minPrice(""),
    },
    maxPrice && {
      label: `Up to ${formatProductPrice(maxPrice)}`,
      clear: () => actions.maxPrice(""),
    },
    availableOnly && {
      label: "In stock",
      clear: () => actions.availableOnly(false),
    },
    onSale && {
      label: `On sale: ${onSale === "yes" ? "Yes" : "No"}`,
      clear: () => actions.onSale(""),
    },
  ].filter(Boolean);

  return {
    actions,
    activeFilters,
    clearFilters,
    error,
    filterOptions,
    filters,
    loadProducts,
    loading,
    page,
    pageCount,
    setPage,
    priceBounds,
    totalProducts: sortedProducts.length,
    visibleProducts,
  };
}
