import { api } from "../lib/api/api";

export const adminService = {
  // Products APIs
  getProducts: (options) => api.get("/products/admin", options),

  getProductById: (id, options) => api.get(`/products/${id}`, options),

  createProduct: (payload, options) =>
    api.post("/products", payload, options),

  updateProduct: (id, payload, options) =>
    api.patch(`/products/${id}`, payload, options),

  uploadImage: (file, purpose, options) => {
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", purpose);
    return api.post("/uploads/images", form, options);
  },

  deleteProduct: (id, options) =>
    api.del(`/products/${id}`, options),

  getPersonalizationTemplates: (options) => api.get("/personalization-templates", options),

  createPersonalizationTemplate: (payload, options) =>
    api.post("/personalization-templates", payload, options),

  updatePersonalizationTemplate: (groupId, payload, options) =>
    api.patch("/personalization-templates", { groupId, ...payload }, options),

  // Orders APIs
  getOrders: (options) => api.get("/orders", options),

  updateOrderStatus: (id, status, options) =>
    api.patch(`/orders/${id}/status`, { orderStatus: status }, options),
};
