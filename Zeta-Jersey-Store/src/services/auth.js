import { api, tokenStore } from "../lib/api";

export const authService = {
  register: (payload, o) =>
    api.post("/auth/register", {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
    }, o),

  async login({ email, password }, o) {
    const data = await api.post("/auth/login", { email, password }, o);
    tokenStore.set(data?.token ?? data?.accessToken);
    return data;
  },

  me: (o) => api.get("/auth/me", { ...o, auth: true }),

  requestPasswordReset: ({ email }, o) => api.post("/auth/password/forgot", { email }, o),

  verifyEmail: ({ email, password }, o) => api.post("/auth/verify-email", { email, password }, o),

  confirmEmail: ({ email, token }, o) => api.post("/auth/verify-email/confirm", { email, token }, o),

  resendVerification: ({ email }, o) => api.post("/auth/verify-email/resend", { email }, o),

  changePassword: ({ email, oldPassword, newPassword }, o) =>
    api.post("/auth/password/change", { email, oldPassword, newPassword }, { ...o, auth: true }),

  async logout() {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    tokenStore.clear();
  },
};