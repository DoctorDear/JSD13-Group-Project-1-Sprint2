import { useEffect, useState } from "react";
import ProductCard from "../ProductCard";
import { api } from "../../lib/api.js";

const sortByTab = {
  "Best Sellers": "best-selling",
  "New Arrivals": "newest",
};

function ProfileProductSection({ activeProductTab, onProductTabChange }) {
  const [result, setResult] = useState({ key: "", products: [], error: "" });
  const [retryCount, setRetryCount] = useState(0);
  const sort = sortByTab[activeProductTab];
  const requestKey = `${sort}:${retryCount}`;

  useEffect(() => {
    const controller = new AbortController();

    api.get(`/products?sort=${sort}&limit=6`, { signal: controller.signal })
      .then((products) => {
        if (!Array.isArray(products)) throw new Error("Could not read the product catalog.");
        if (!controller.signal.aborted) setResult({ key: requestKey, products, error: "" });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, products: [], error: error.message || "Could not load products." });
        }
      });

    return () => controller.abort();
  }, [requestKey, sort]);

  return (
    <section className="mt-14" aria-labelledby="profile-products-title">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#8a948c]">SHOP FAVORITES</p>
          <h2 id="profile-products-title" className="mt-1 text-2xl font-black sm:text-3xl">You May Also Like</h2>
        </div>
        <div className="join" role="group" aria-label="Product sort">
          {Object.keys(sortByTab).map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeProductTab === tab}
              className={`join-item btn btn-sm ${activeProductTab === tab ? "bg-zeta-main text-white" : "bg-white text-zeta-muted"}`}
              onClick={() => onProductTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {result.key !== requestKey ? (
        <p role="status" className="text-sm text-zeta-muted">Loading products...</p>
      ) : result.error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
          <p>{result.error}</p>
          <button type="button" className="mt-3 font-semibold underline" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
        </div>
      ) : result.products.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-zeta-muted">No products available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProfileProductSection;
