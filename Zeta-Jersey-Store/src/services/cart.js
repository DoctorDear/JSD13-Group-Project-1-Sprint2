import { api } from "../lib/api.js";

export const cartService = {
  get: () => api.get("/users/cart"),
  add: (item) => api.post("/users/cart", item),
  update: (id, quantity) => api.patch(`/users/cart/${id}`, { quantity }),
  remove: (id) => api.del(`/users/cart/${id}`),
};
