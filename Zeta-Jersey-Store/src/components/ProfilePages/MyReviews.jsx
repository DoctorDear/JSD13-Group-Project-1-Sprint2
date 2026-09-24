import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reviewService } from "../../services/review.js";

const reviewDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });
const ratingLabels = { comfort: "Comfort", quality: "Quality", fit: "Fit", length: "Length" };

function ReviewImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zeta-main-lighter">
      {src && !failed ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className="size-full object-contain" />
      ) : <span className="px-2 text-center text-[10px] text-zeta-muted">Image unavailable</span>}
    </div>
  );
}

export default function MyReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    reviewService.getMyReviews({ signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data.reviews)) throw new Error("Could not read your reviews.");
        if (!controller.signal.aborted) setReviews(data.reviews);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || "Could not load your reviews.");
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = () => {
    setError("");
    setReviews(null);
    setAttempt((value) => value + 1);
  };

  return (
    <section aria-labelledby="my-reviews-title">
      <p className="text-xs font-bold tracking-widest text-zeta-muted">MY REVIEWS</p>
      <h1 id="my-reviews-title" className="mt-1 text-2xl font-black sm:text-3xl">My Reviews</h1>
      <p className="mt-2 text-sm text-zeta-muted">Product reviews you have written.</p>

      {error ? (
        <div role="alert" className="mt-6 rounded-xl bg-white p-6 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={retry} className="mt-3 font-semibold underline">Retry</button>
        </div>
      ) : reviews === null ? (
        <p role="status" className="mt-6 text-sm text-zeta-muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zeta-main-lighter bg-white p-8 text-center">
          <p className="font-bold">You have not reviewed a product yet.</p>
          <p className="mt-2 text-sm text-zeta-muted">Open a product from a completed order to write your first review.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-zeta-main-lighter bg-white p-5 sm:p-6">
              <div className="flex flex-wrap gap-4">
                <ReviewImage key={review.product?.images?.[0] || "no-image"} src={review.product?.images?.[0]} name={review.product?.name || "Product"} />
                <div className="min-w-0 flex-1">
                  {review.product ? (
                    <Link to={`/products/${review.product.id}`} className="font-bold text-zeta-main hover:underline">{review.product.name}</Link>
                  ) : <p className="font-bold">Product unavailable</p>}
                  <p className="mt-1 text-sm font-semibold text-yellow-600" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  <p className="mt-1 text-xs text-zeta-muted">{reviewDate.format(new Date(review.createdAt))} · {review.status}</p>
                  {review.product && (
                    <Link to={`/products/${review.product.id}/review?from=profile`} className="mt-2 inline-block text-sm font-semibold text-zeta-main underline underline-offset-2">Edit review</Link>
                  )}
                </div>
              </div>
              {review.title && <h2 className="mt-4 font-bold">{review.title}</h2>}
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#4a5551]">{review.body}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {Object.entries(ratingLabels).map(([field, label]) => (
                  review.detailedRatings?.[field] && (
                    <span key={field} className="rounded-full bg-zeta-main-lighter px-3 py-1.5 text-zeta-main">
                      {label}: {review.detailedRatings[field]} / 5
                    </span>
                  )
                ))}
                {typeof review.isRecommended === "boolean" && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                    {review.isRecommended ? "Recommended" : "Would not recommend"}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
