import test from "node:test";
import assert from "node:assert/strict";
import { buildReviewPayload, toReviewForm } from "./reviewPayload.js";

const completeForm = {
  rating: "4",
  detailedRatings: { comfort: "5", quality: "4", fit: "3", length: "2" },
  title: "  Nice shirt  ",
  body: "  Feels comfortable  ",
  recommended: "yes",
};

test("submits overall and all four detailed ratings with a recommendation", () => {
  assert.deepEqual(buildReviewPayload(completeForm), {
    rating: 4,
    detailedRatings: { comfort: 5, quality: 4, fit: 3, length: 2 },
    title: "Nice shirt",
    body: "Feels comfortable",
    isRecommended: true,
  });
});

test("rejects an incomplete review instead of publishing misleading summary data", () => {
  assert.throws(() => buildReviewPayload({ ...completeForm, detailedRatings: { ...completeForm.detailedRatings, fit: "" } }), /Fit/);
  assert.throws(() => buildReviewPayload({ ...completeForm, recommended: "" }), /recommend/i);
  assert.throws(() => buildReviewPayload({ ...completeForm, body: "  " }), /review/i);
  assert.throws(() => buildReviewPayload({ ...completeForm, title: "  " }), /title/i);
});

test("loads an existing review into the same form, including a negative recommendation", () => {
  assert.deepEqual(toReviewForm({
    rating: 3,
    detailedRatings: { comfort: 2, quality: 4, fit: 3, length: 1 },
    isRecommended: false,
    title: "Runs short",
    body: "Size up",
  }), {
    rating: "3",
    detailedRatings: { comfort: "2", quality: "4", fit: "3", length: "1" },
    recommended: "no",
    title: "Runs short",
    body: "Size up",
  });
});
