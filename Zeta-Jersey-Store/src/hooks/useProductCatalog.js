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
  const search = searchParams.get("search") || "";
  const [team, setTeam] = useState(() => searchParams.getAll("team").filter(Boolean));
  const [league, setLeague] = useState(() => {
    const values = searchParams.getAll("league").filter(Boolean);
    return values.length ? values : searchParams.get("category") ? [searchParams.get("category")] : [];
  });
  const [collection, setCollection] = useState(() => searchParams.getAll("collection").filter(Boolean));
  const [edition, setEdition] = useState(() => searchParams.getAll("edition").filter(Boolean));
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const readChoiceValues = (key) => searchParams.getAll(key)
    .map((value) => value === "true" ? "yes" : value === "false" ? "no" : value)
    .filter((value) => value === "yes" || value === "no");
  const [availability, setAvailability] = useState(() => readChoiceValues("available"));
  const [onSale, setOnSale] = useState(() => readChoiceValues("onSale"));
  const [sort, setSort] = useState(() => searchParams.get("sort") || "featured");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // A new URL search starts at the first page of results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search]);

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
    team.forEach((value) => nextParams.append("team", value));
    league.forEach((value) => nextParams.append("league", value));
    collection.forEach((value) => nextParams.append("collection", value));
    edition.forEach((value) => nextParams.append("edition", value));
    if (minPrice) nextParams.set("minPrice", minPrice);
    if (maxPrice) nextParams.set("maxPrice", maxPrice);
    availability.forEach((value) => nextParams.append("available", value));
    onSale.forEach((value) => nextParams.append("onSale", value));
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
    availability,
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
      availability,
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
      availability,
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
    search: (value) => {
      setPage(1);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (value.trim()) next.set("search", value.trim());
        else next.delete("search");
        return next;
      }, { replace: true });
    },
    team: updateFilter(setTeam),
    league: updateFilter(setLeague),
    collection: updateFilter(setCollection),
    edition: updateFilter(setEdition),
    minPrice: updateFilter(setMinPrice),
    maxPrice: updateFilter(setMaxPrice),
    availability: updateFilter(setAvailability),
    onSale: updateFilter(setOnSale),
    sort: updateFilter(setSort),
  };

  const clearFilters = () => {
    setPage(1);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("search");
      return next;
    }, { replace: true });
    setTeam([]);
    setLeague([]);
    setCollection([]);
    setEdition([]);
    setMinPrice("");
    setMaxPrice("");
    setAvailability([]);
    setOnSale([]);
    setSort("featured");
  };

  const activeFilters = [
    search && { label: `Search: ${search}`, clear: () => actions.search("") },
    ...team.map((value) => ({ label: `Team: ${value}`, clear: () => actions.team(team.filter((item) => item !== value)) })),
    ...league.map((value) => ({ label: `League: ${value}`, clear: () => actions.league(league.filter((item) => item !== value)) })),
    ...collection.map((value) => ({ label: `Collection: ${value}`, clear: () => actions.collection(collection.filter((item) => item !== value)) })),
    ...edition.map((value) => ({ label: `Edition: ${value}`, clear: () => actions.edition(edition.filter((item) => item !== value)) })),
    minPrice && {
      label: `From ${formatProductPrice(minPrice)}`,
      clear: () => actions.minPrice(""),
    },
    maxPrice && {
      label: `Up to ${formatProductPrice(maxPrice)}`,
      clear: () => actions.maxPrice(""),
    },
    ...availability.map((value) => ({
      label: `Availability: ${value === "yes" ? "In stock" : "Out of stock"}`,
      clear: () => actions.availability(availability.filter((item) => item !== value)),
    })),
    ...onSale.map((value) => ({
      label: `On sale: ${value === "yes" ? "Yes" : "No"}`,
      clear: () => actions.onSale(onSale.filter((item) => item !== value)),
    })),
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
