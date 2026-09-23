import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const RATING_LABELS = {
  comfort: ["Comfort", "Uncomfortable", "Comfortable"],
  quality: ["Quality", "Poor", "Excellent"],
  fit: ["Fit", "Too tight", "Too loose"],
  length: ["Length", "Runs short", "Runs long"],
};

const renderStars = (rating) => {
  const filled = Math.round(rating || 0);
  return (
    <span aria-label={`${rating || 0} out of 5 stars`} className="tracking-[0.14em] text-zeta-main">
      {"★".repeat(filled)}
      <span className="text-slate-200">{"★".repeat(5 - filled)}</span>
    </span>
  );
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value),
  );

function RatingScale({ label, lowLabel, highLabel, value }) {
  if (!value) return null;

  const position = `${((value - 1) / 4) * 100}%`;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="font-semibold text-slate-900">{label}</span>
        <span className="text-sm font-semibold text-zeta-main">{value.toFixed(1)} / 5</span>
      </div>
      <div className="relative grid grid-cols-5 gap-1" aria-label={`${label}: ${value} out of 5`}>
        {[0, 1, 2, 3, 4].map((item) => (
          <span key={item} className="h-1.5 bg-slate-200" />
        ))}
        <span
          className="absolute top-1/2 h-1.5 w-16 -translate-x-1/2 -translate-y-1/2 bg-zeta-main"
          style={{ left: position }}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm text-zeta-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function ProductReviewSection({ productId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const controller = new AbortController();

    const loadReviews = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ limit: "10", sort });
        if (rating) query.set("rating", rating);
        if (tag) query.set("tags", tag);

        const response = await fetch(`${API_BASE_URL}/v1/products/${productId}/reviews?${query}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Unable to load reviews");
        setData(payload);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Unable to load reviews");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    if (productId) loadReviews();
    return () => controller.abort();
  }, [productId, rating, tag, sort]);

  if (loading && !data) {
    return (
      <section className="pt-8 sm:pt-10">
        <div className="h-8 w-48 rounded bg-slate-100" />
        <div className="mt-6 h-56 rounded-2xl bg-slate-100" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-8 sm:pt-10">
        <h2 className="text-2xl font-bold text-zeta-main">Reviews</h2>
        <p className="mt-3 text-sm text-zeta-muted">{error}</p>
      </section>
    );
  }

  const { summary, reviews = [] } = data;
  const detailedRatings = summary.detailedRatings || {};

  return (
    <section className="pt-8 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zeta-muted">Customer feedback</p>
          <h2 className="mt-1 text-2xl font-bold text-zeta-main sm:text-3xl">
            Reviews ({summary.count.toLocaleString()})
          </h2>
        </div>
        {summary.count > 0 && (
          <div className="flex items-center gap-3 text-lg font-semibold">
            {renderStars(summary.averageRating)}
            <span>{summary.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {summary.count === 0 ? (
        <div className="mt-7 rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm text-zeta-muted">
          There are no reviews yet. Be the first verified buyer to share your experience.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-8 rounded-2xl bg-slate-50 p-5 sm:p-7 lg:grid-cols-[220px_1fr]">
            <div className="flex flex-col justify-center border-b border-slate-200 pb-6 lg:border-r lg:border-b-0 lg:pb-0 lg:pr-8">
              <span className="text-5xl font-bold text-zeta-main">{summary.averageRating.toFixed(1)}</span>
              <div className="mt-2 text-lg">{renderStars(summary.averageRating)}</div>
              <p className="mt-3 text-sm text-zeta-muted">
                {summary.recommendRate}% recommend this product
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {Object.entries(RATING_LABELS).map(([field, [label, lowLabel, highLabel]]) => (
                <RatingScale
                  key={field}
                  label={label}
                  lowLabel={lowLabel}
                  highLabel={highLabel}
                  value={detailedRatings[field]}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 border-y border-slate-200 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 font-semibold text-slate-900">Filter by rating</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRating("")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${!rating ? "border-zeta-main bg-zeta-main text-white" : "border-slate-200 hover:border-zeta-main"}`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(String(value))}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium ${rating === String(value) ? "border-zeta-main bg-zeta-main text-white" : "border-slate-200 hover:border-zeta-main"}`}
                    >
                      ★ {value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900">
                Sort by
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 min-w-36 rounded-lg border border-slate-300 bg-white px-3 font-medium outline-none focus:border-zeta-main"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest rating</option>
                  <option value="lowest">Lowest rating</option>
                  <option value="helpful">Most helpful</option>
                </select>
              </label>
            </div>

            {summary.tags.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 font-semibold text-slate-900">Filter by topic</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTag("")}
                    className={`rounded-full px-3 py-1.5 text-sm ${!tag ? "bg-zeta-sub text-zeta-main" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    All topics
                  </button>
                  {summary.tags.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setTag(item.name)}
                      className={`rounded-full px-3 py-1.5 text-sm ${tag === item.name ? "bg-zeta-sub text-zeta-main" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      {item.name} ({item.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-200">
            {loading && <p className="py-6 text-sm text-zeta-muted">Updating reviews…</p>}
            {!loading && reviews.length === 0 && (
              <p className="py-8 text-sm text-zeta-muted">No reviews match these filters.</p>
            )}
            {reviews.map((review) => (
              <article key={review.id} className="grid gap-4 py-7 sm:grid-cols-[180px_1fr]">
                <div>
                  <div className="text-lg">{renderStars(review.rating)}</div>
                  <p className="mt-2 font-semibold text-slate-900">{review.reviewer.name}</p>
                  <p className="mt-1 text-sm text-zeta-muted">{formatDate(review.createdAt)}</p>
                  {review.verifiedPurchase && (
                    <span className="mt-3 inline-flex rounded-full bg-zeta-main-lighter px-2.5 py-1 text-xs font-semibold text-zeta-main">
                      Verified purchase
                    </span>
                  )}
                </div>
                <div>
                  {review.title && <h3 className="font-semibold text-slate-950">{review.title}</h3>}
                  <p className="mt-2 leading-7 text-slate-700">{review.body}</p>
                  {review.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {review.tags.map((item) => (
                        <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
