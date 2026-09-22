import { api } from "../lib/api";

export const userService = {
  getProfile: (options) => api.get("/users/profile", { ...options, auth: true }),

  updateProfile: ({ firstName, lastName, phone, address }, options) =>
    api.patch(
      "/users/profile",
      { firstName, lastName, phone, ...(address ? { address } : {}) },
      { ...options, auth: true },
    ),

  updateAddress: (addressId, payload, options) =>
    api.patch(`/users/address/${addressId}`, payload, { ...options, auth: true }),
};