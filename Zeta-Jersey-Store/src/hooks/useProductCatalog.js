import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType, useSearchParams } from "react-router-dom";
import {
  buildProductFilterOptions,
  filterProducts,
  formatProductPrice,
  getProductPriceBounds,
  PRODUCT_PAGE_SIZE,
  sortProducts,
} from "../lib/catalog/productCatalog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const catalogHistory = new Map();

export default function useProductCatalog() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [savedCatalog] = useState(() => navigationType === "POP" ? catalogHistory.get(location.key) : null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(savedCatalog?.products ?? []);
  const [loading, setLoading] = useState(!savedCatalog);
  const [error, setError] = useState(savedCatalog?.error ?? null);
  const [page, setPage] = useState(savedCatalog?.page ?? 1);

  // Directly derive all filters from searchParams so URL is the single source of truth
  const search = searchParams.get("search") || "";
  const team = useMemo(() => searchParams.getAll("team").filter(Boolean), [searchParams]);
  const league = useMemo(() => {
    const values = searchParams.getAll("league").filter(Boolean);
    return values.length ? values : searchParams.get("category") ? [searchParams.get("category")] : [];
  }, [searchParams]);
  const collection = useMemo(() => searchParams.getAll("collection").filter(Boolean), [searchParams]);
  const edition = useMemo(() => searchParams.getAll("edition").filter(Boolean), [searchParams]);
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const readChoiceValues = useCallback(
    (key) =>
      searchParams
        .getAll(key)
        .map((value) => {
          const v = String(value).toLowerCase();
          if (v === "true" || v === "yes") return "yes";
          if (v === "false" || v === "no") return "no";
          return v;
        })
        .filter((value) => value === "yes" || value === "no"),
    [searchParams]
  );

  const availability = useMemo(() => readChoiceValues("available"), [readChoiceValues]);
  const onSale = useMemo(() => readChoiceValues("onSale"), [readChoiceValues]);
  const sort = searchParams.get("sort") || "featured";

  // Reset page to 1 whenever URL search parameters change
  const searchParamsString = searchParams.toString();
  const previousSearch = useRef(searchParamsString);
  useEffect(() => {
    if (previousSearch.current === searchParamsString) return;
    previousSearch.current = searchParamsString;
    setPage(1);
  }, [searchParamsString]);

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
      const { default: productData } = await import("../data/products.json");
      setProducts(productData);
      setError(
        "The live catalog is unavailable right now. Showing the saved demo catalog instead.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (savedCatalog) return;
    // The catalog request is an external synchronization; its state updates happen asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts, savedCatalog]);

  useEffect(() => {
    if (!loading) {
      catalogHistory.set(location.key, { products, error, page });
      if (catalogHistory.size > 30) catalogHistory.delete(catalogHistory.keys().next().value);
    }
  }, [location.key, products, error, page, loading]);

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

  const updateArrayFilter = (key) => (values) => {
    setPage(1);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete(key);
      if (key === "league") next.delete("category");
      const list = Array.isArray(values) ? values : [values];
      list.filter(Boolean).forEach((val) => next.append(key, val));
      return next;
    }, { replace: true });
  };

  const updateSingleFilter = (key, defaultValue = "") => (value) => {
    setPage(1);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value && value !== defaultValue) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
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
    team: updateArrayFilter("team"),
    league: updateArrayFilter("league"),
    collection: updateArrayFilter("collection"),
    edition: updateArrayFilter("edition"),
    minPrice: updateSingleFilter("minPrice"),
    maxPrice: updateSingleFilter("maxPrice"),
    availability: updateArrayFilter("available"),
    onSale: updateArrayFilter("onSale"),
    sort: updateSingleFilter("sort", "featured"),
  };

  const clearFilters = () => {
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
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
