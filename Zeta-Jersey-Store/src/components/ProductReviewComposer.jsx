import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { reviewService } from "../services/review.js";

export default function ProductReviewComposer({ productId }) {
  const { booting, isAuthenticated, user } = useAuth();
  const [eligibility, setEligibility] = useState(null);
  const [checkedUser, setCheckedUser] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (booting || !isAuthenticated || !productId) return;
    const controller = new AbortController();
    reviewService.getReviewEligibility(productId, { signal: controller.signal })
      .then((data) => {
        if (typeof data.canReview !== "boolean" || typeof data.hasReviewed !== "boolean") {
          throw new Error("Could not check review eligibility.");
        }
        if (!controller.signal.aborted) {
          setEligibility(data);
          setCheckedUser(user);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || "Could not check review eligibility.");
      });
    return () => controller.abort();
  }, [productId, booting, isAuthenticated, user, attempt]);

  if (booting || !isAuthenticated) return null;

  if (error) {
    return (
      <div role="alert" className="mt-8 rounded-xl bg-slate-50 p-5 text-sm text-red-700">
        <p>{error}</p>
        <button type="button" onClick={() => { setError(""); setEligibility(null); setAttempt((value) => value + 1); }} className="mt-2 font-semibold underline">Retry</button>
      </div>
    );
  }
  if (!eligibility || checkedUser !== user) return <p role="status" className="mt-8 text-sm text-zeta-muted">Checking review eligibility...</p>;
  if (eligibility.hasReviewed || !eligibility.canReview) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-zeta-main">Share your experience</h2>
        <p className="mt-1 text-sm text-zeta-muted">Your completed purchase is eligible for a review.</p>
      </div>
      <Link to={`/products/${productId}/review`} className="rounded-lg bg-zeta-main px-5 py-3 text-sm font-semibold text-white">Write a review</Link>
    </div>
  );
}
