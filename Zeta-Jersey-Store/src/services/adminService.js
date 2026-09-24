import { api } from "../lib/api";

export const adminService = {
  // Products APIs
  getProducts: (options) => api.get("/products", options),

  getProductById: (id, options) => api.get(`/products/${id}`, options),

  createProduct: (payload, options) =>
    api.post("/products", payload, options),

  updateProduct: (id, payload, options) =>
    api.patch(`/products/${id}`, payload, options),

  deleteProduct: (id, options) =>
    api.del(`/products/${id}`, options),

  // Orders APIs
  getOrders: (options) => api.get("/orders", options),

  updateOrderStatus: (id, status, options) =>
    api.patch(`/orders/${id}/status`, { orderStatus: status }, options),
};