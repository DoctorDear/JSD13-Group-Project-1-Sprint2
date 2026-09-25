import { api } from "../lib/api.js";

export const orderService = {
  getMyOrders: (options) => api.get("/orders/my-orders", options),
  create: (shippingAddress, paymentMethod) => api.post("/orders", { shippingAddress, paymentMethod }),
  createCheckoutSession: (shippingAddress, paymentMethod) => api.post("/orders/checkout-session", { shippingAddress, paymentMethod }),
  getById: (id) => api.get(`/orders/${id}`),
  getPaymentOptions: () => api.get('/orders/payment-options'),
  resumeCheckoutSession: (id) => api.get(`/orders/${id}/checkout-session`),
};
