import { api } from "../lib/api.js";

const wishlistPath = "/users/wishlist";

export const wishlistService = {
  get: (options) => api.get(wishlistPath, options),
  add: (productId) => api.post(`${wishlistPath}/${productId}`),
  remove: (productId) => api.del(`${wishlistPath}/${productId}`),
};
