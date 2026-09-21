import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CircleX,
  PackageSearch,
  RefreshCw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import useProductCatalog from "../hooks/useProductCatalog";
import { getProductId, PRODUCT_PAGE_SIZE } from "../lib/productCatalog";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

const AllProductsPage = () => {
  const {
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
    priceBounds,
    setPage,
    totalProducts,
    visibleProducts,
  } = useProductCatalog();

  return (
    <div className="min-h-screen bg-[#fafaff]">
      <Navbar page="product-browse" />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-7 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="transition hover:text-zeta-main">
            Home
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="font-medium text-zeta-main">All products</span>
        </nav>

        <section className="border-b border-gray-200 pb-8">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            All products
          </h1>
        </section>

        {error && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadProducts}
              className="inline-flex items-center gap-2 self-start font-semibold underline-offset-4 hover:underline sm:self-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        <div className="mt-8 border-y border-gray-200 py-5">
          <ProductFilters
            options={filterOptions}
            values={filters}
            onChange={actions}
            onClear={clearFilters}
            priceBounds={priceBounds}
          />
        </div>

        <div className="mt-8">
          <section aria-labelledby="results-heading">
            <div className="border-b border-gray-200 pb-5">
              <h2
                id="results-heading"
                className="text-3xl font-bold tracking-tight text-gray-900"
              >
                {totalProducts} products
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? "Finding the latest drops…" : "Shop the collection"}
              </p>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 py-5">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Active filters
                </span>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={filter.clear}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zeta-main-lighter px-3 py-1.5 text-xs font-semibold text-zeta-main transition hover:bg-zeta-sub-lighter"
                  >
                    {filter.label}
                    <CircleX className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 text-xs font-semibold text-gray-500 underline-offset-4 hover:text-zeta-main hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: PRODUCT_PAGE_SIZE }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={getProductId(product)}
                      product={product}
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5">
                    <p className="text-sm text-gray-500">
                      Page{" "}
                      <span className="font-semibold text-gray-700">
                        {page}
                      </span>{" "}
                      of {pageCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        disabled={page === 1}
                        aria-label="Previous page"
                        className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-zeta-main hover:text-zeta-main disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) => Math.min(pageCount, current + 1))
                        }
                        disabled={page === pageCount}
                        aria-label="Next page"
                        className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-zeta-main hover:text-zeta-main disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
                <PackageSearch
                  className="h-12 w-12 text-zeta-main/40"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Try a different search or remove a filter to see more of the
                  Zeta collection.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zeta-main px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#241878]"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllProductsPage;
