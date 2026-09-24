const ratingFields = ["comfort", "quality", "fit", "length"];

export function toReviewForm(review) {
  return {
    rating: review?.rating == null ? "" : String(review.rating),
    detailedRatings: Object.fromEntries(
      ratingFields.map((field) => [field, review?.detailedRatings?.[field] == null ? "" : String(review.detailedRatings[field])]),
    ),
    recommended: review?.isRecommended == null ? "" : review.isRecommended ? "yes" : "no",
    title: review?.title || "",
    body: review?.body || "",
  };
}

function parseRating(value, label) {
  const rating = Number(value);
  if (value === "" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error(`Choose a ${label} rating from 1 to 5.`);
  }
  return rating;
}

export function buildReviewPayload(form) {
  const rating = parseRating(form.rating, "overall");
  const detailedRatings = Object.fromEntries(
    ratingFields.map((field) => [
      field,
      parseRating(form.detailedRatings?.[field], field[0].toUpperCase() + field.slice(1)),
    ]),
  );
  if (form.recommended !== "yes" && form.recommended !== "no") {
    throw new Error("Choose whether you recommend this product.");
  }
  const body = String(form.body || "").trim();
  if (!body) throw new Error("Write a review before submitting.");
  const title = String(form.title || "").trim();
  if (!title) throw new Error("Add a short title to your review.");

  return {
    rating,
    detailedRatings,
    title,
    body,
    isRecommended: form.recommended === "yes",
  };
}
