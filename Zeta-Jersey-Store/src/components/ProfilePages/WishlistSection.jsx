import { Link } from "react-router-dom";
import ProductCard from "../ProductCard.jsx";
import { useWishlist } from "../../contexts/wishlistContext.js";

export default function WishlistSection() {
  const { items, loading, error, reload } = useWishlist();

  return (
    <section aria-labelledby="wishlist-title">
      <p className="text-xs font-bold tracking-widest text-[#8a948c]">FAVORITES</p>
      <h1 id="wishlist-title" className="mt-1 text-2xl font-black sm:text-3xl">My Favorites</h1>
      <p className="mt-2 text-sm text-zeta-muted">Jerseys you have saved for later.</p>

      {loading ? (
        <p role="status" className="mt-6 text-sm text-zeta-muted">Loading your wishlist...</p>
      ) : error ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={reload} className="mt-3 font-semibold underline">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zeta-main-lighter bg-white p-8 text-center">
          <p className="font-bold">Your wishlist is empty.</p>
          <p className="mt-2 text-sm text-zeta-muted">Save a jersey with the heart button to see it here.</p>
          <Link to="/products" className="mt-5 inline-block rounded-xl bg-zeta-main px-5 py-2.5 font-semibold text-white">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );
}
