import { useState } from "react";
import { reviewService } from "../services/review.js";
import { buildReviewPayload, toReviewForm } from "../lib/reviewPayload.js";

const scores = [1, 2, 3, 4, 5];

function StarRating({ name, label, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{label} <span className="text-red-600">*</span></legend>
      <div className="mt-2 flex gap-1">
        {scores.map((score) => (
          <label key={score} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={score}
              checked={Number(value) === score}
              onChange={() => onChange(String(score))}
              aria-label={`${score} out of 5`}
              required
              className="peer sr-only"
            />
            <span aria-hidden="true" className="inline-block rounded text-3xl leading-none text-zeta-main peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zeta-main">
              {score <= Number(value) ? "★" : "☆"}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-zeta-muted">{value ? `${value} / 5` : "Select a rating"}</p>
    </fieldset>
  );
}

function ScaleRating({ name, label, lowLabel, middleLabel, highLabel, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{label} <span className="text-red-600">*</span></legend>
      <div className="relative mt-4 flex justify-between">
        <div className="absolute inset-x-3 top-3 h-px bg-slate-300" aria-hidden="true" />
        {scores.map((score) => (
          <label key={score} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={score}
              checked={Number(value) === score}
              onChange={() => onChange(String(score))}
              aria-label={`${label}: ${score} out of 5`}
              required
              className="peer sr-only"
            />
            <span aria-hidden="true" className={`block size-6 rounded-full border-2 border-zeta-main peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zeta-main ${Number(value) === score ? "bg-zeta-main" : "bg-white"}`} />
          </label>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 text-xs text-zeta-muted">
        <span>{lowLabel}</span>
        <span className="text-center">{middleLabel}</span>
        <span className="text-right">{highLabel}</span>
      </div>
      <p className="mt-1 text-xs text-zeta-muted">{value ? `${value} / 5` : "Select a rating"}</p>
    </fieldset>
  );
}

export default function ReviewForm({ productId, initialReview, onCancel, onReviewed }) {
  const [rating, setRating] = useState(() => toReviewForm(initialReview).rating);
  const [detailedRatings, setDetailedRatings] = useState(() => toReviewForm(initialReview).detailedRatings);
  const [recommended, setRecommended] = useState(() => toReviewForm(initialReview).recommended);
  const [title, setTitle] = useState(() => toReviewForm(initialReview).title);
  const [body, setBody] = useState(() => toReviewForm(initialReview).body);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setDetailedRating = (field) => (value) => {
    setDetailedRatings((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = buildReviewPayload({ rating, detailedRatings, recommended, title, body });
    } catch (err) {
      setError(err.message);
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (initialReview) await reviewService.updateMyProductReview(productId, payload);
      else await reviewService.createProductReview(productId, payload);
      onReviewed();
    } catch (err) {
      if (!initialReview && err.status === 409) onReviewed();
      else setError(err.message || "Could not submit your review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <StarRating name={`overall-${productId}`} label="Overall rating" value={rating} onChange={setRating} />

      <fieldset>
        <legend className="text-sm font-bold">Would you recommend this product? <span className="text-red-600">*</span></legend>
        <div className="mt-3 flex gap-6">
          {[["yes", "Yes"], ["no", "No"]].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name={`recommended-${productId}`} value={value} checked={recommended === value} onChange={() => setRecommended(value)} required className="accent-zeta-main" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`body-${productId}`} className="block text-sm font-bold">Share your experience <span className="text-red-600">*</span></label>
        <p className="mt-1 text-xs leading-5 text-zeta-muted">Tell other buyers what you liked, how it feels, and how it fits.</p>
        <textarea id={`body-${productId}`} value={body} onChange={(event) => setBody(event.target.value)} rows={5} maxLength={2000} required placeholder="Write your review" className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:border-zeta-main" />
      </div>

      <div>
        <label htmlFor={`title-${productId}`} className="block text-sm font-bold">Review title <span className="text-red-600">*</span></label>
        <p className="mt-1 text-xs text-zeta-muted">Sum up your review in a few words.</p>
        <input id={`title-${productId}`} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required placeholder="A short headline" className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:border-zeta-main" />
      </div>

      <ScaleRating name={`fit-${productId}`} label="Fit" lowLabel="Too tight" middleLabel="Just right" highLabel="Too loose" value={detailedRatings.fit} onChange={setDetailedRating("fit")} />
      <ScaleRating name={`length-${productId}`} label="Length" lowLabel="Too short" middleLabel="Just right" highLabel="Too long" value={detailedRatings.length} onChange={setDetailedRating("length")} />
      <StarRating name={`comfort-${productId}`} label="Comfort" value={detailedRatings.comfort} onChange={setDetailedRating("comfort")} />
      <StarRating name={`quality-${productId}`} label="Quality" value={detailedRatings.quality} onChange={setDetailedRating("quality")} />

      <p className="text-xs leading-5 text-zeta-muted">Your review will appear publicly with the name on your account.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button type="submit" disabled={saving} className="rounded-lg bg-zeta-main px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : initialReview ? "Save changes" : "Submit review"}</button>
        <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold disabled:opacity-50">Cancel</button>
      </div>
    </form>
  );
}
