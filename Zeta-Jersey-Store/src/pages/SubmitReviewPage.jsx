import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import { api } from "../lib/api.js";
import { reviewService } from "../services/review.js";

export default function SubmitReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = new URLSearchParams(location.search).get("from") === "profile";
  const returnTo = fromProfile ? "/profile?tab=reviews" : `/products/${id}#reviews`;
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get(`/products/${id}`, { signal: controller.signal }),
      reviewService.getReviewEligibility(id, { signal: controller.signal }),
    ])
      .then(async ([productData, eligibility]) => {
        if (!productData.product || typeof eligibility.canReview !== "boolean") {
          throw new Error("Could not load this review page.");
        }
        const existingReview = eligibility.hasReviewed
          ? (await reviewService.getMyProductReview(id, { signal: controller.signal })).review
          : null;
        if (eligibility.hasReviewed && !existingReview) {
          throw new Error("Could not load your review.");
        }
        if (!controller.signal.aborted) setPageData({ id, product: productData.product, eligibility, existingReview });
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError({ id, message: err.message || "Could not load this review page." });
      });
    return () => controller.abort();
  }, [id, attempt]);

  const retry = () => {
    setError(null);
    setPageData(null);
    setAttempt((value) => value + 1);
  };

  const current = pageData?.id === id ? pageData : null;
  const currentError = error?.id === id ? error.message : null;

  return (
    <>
      <Navbar page="product-detail" />
      <main className="min-h-screen bg-white px-4 py-8 text-[#18251e] sm:px-6 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <Link to={returnTo} className="text-sm font-semibold text-zeta-main underline underline-offset-4">← Back to {fromProfile ? "My Reviews" : "product"}</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-16">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-zeta-muted">CUSTOMER REVIEW</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">{current?.existingReview ? "Edit your review" : "Write a review"}</h1>
              <p className="mt-3 text-sm text-zeta-muted">Share how this jersey feels and fits after your purchase.</p>

              {currentError ? (
                <div role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700">
                  <p>{currentError}</p>
                  <button type="button" onClick={retry} className="mt-3 font-semibold underline">Retry</button>
                </div>
              ) : !current ? (
                <p role="status" className="mt-8 text-sm text-zeta-muted">Loading review form...</p>
              ) : !current.eligibility.canReview && !current.existingReview ? (
                <div className="mt-8 rounded-xl bg-zeta-main-lighter p-6">
                  <p className="font-semibold">You can review this product after your order is completed.</p>
                  <Link to="/profile" className="mt-3 inline-block text-sm font-semibold text-zeta-main underline">View my orders</Link>
                </div>
              ) : (
                <ReviewForm
                  key={current.existingReview?.id || `new-${id}`}
                  productId={id}
                  initialReview={current.existingReview}
                  onCancel={() => navigate(returnTo)}
                  onReviewed={() => navigate(returnTo, { replace: true })}
                />
              )}
            </div>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <Link
                to={`/products/${id}`}
                className="group block rounded-2xl bg-[#f5f7f2] p-6 transition hover:bg-zeta-main-lighter focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zeta-main sm:p-7"
              >
                <p className="text-xs font-bold tracking-[0.16em] text-zeta-muted">YOUR PRODUCT</p>
                <h2 className="mt-3 text-xl font-bold text-zeta-main group-hover:underline">{current?.product.name || "Loading product..."}</h2>
                {(current?.eligibility.canReview || current?.existingReview) && <p className="mt-2 text-sm font-semibold text-green-700">Verified purchase</p>}
                <p className="mt-3 text-sm font-semibold text-zeta-main">View product →</p>
              </Link>
              <div className="mt-8">
                <h2 className="text-base font-bold">Tips for a helpful review</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#4a5551]">
                  <li>Describe how the jersey fits and feels when worn.</li>
                  <li>Share specific details about comfort and quality.</li>
                  <li>Keep personal information out of your review.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
