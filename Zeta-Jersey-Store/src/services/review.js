import { api } from "../lib/api.js";

export const reviewService = {
  getProductReviews: (productId, query, options) => api.get(`/products/${productId}/reviews?${query}`, options),
  getMyReviews: (options) => api.get("/users/reviews", options),
  getReviewEligibility: (productId, options) => api.get(`/products/${productId}/reviews/eligibility`, options),
  getMyProductReview: (productId, options) => api.get(`/products/${productId}/reviews/mine`, options),
  createProductReview: (productId, payload, options) =>
    api.post(`/products/${productId}/reviews`, payload, options),
  updateMyProductReview: (productId, payload, options) =>
    api.patch(`/products/${productId}/reviews/mine`, payload, options),
};
