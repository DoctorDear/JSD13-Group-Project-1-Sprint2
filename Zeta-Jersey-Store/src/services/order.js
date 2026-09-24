import { api } from "../lib/api.js";

export const orderService = {
  getMyOrders: (options) => api.get("/orders/my-orders", options),
};
