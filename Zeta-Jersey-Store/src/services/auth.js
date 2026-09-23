import { api } from "../lib/api";

export const authService = {
  register: (payload, o) =>
    api.post("/auth/register", {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
    }, o),

  login: ({ email, password }, o) => api.post("/auth/login", { email, password }, o),

  me: (o) => api.get("/auth/me", o),

  requestPasswordReset: ({ email }, o) => api.post("/auth/password/forgot", { email }, o),

  verifyEmail: ({ email, password }, o) => api.post("/auth/verify-email", { email, password }, o),

  confirmEmail: ({ email, token }, o) => api.post("/auth/verify-email/confirm", { email, token }, o),

  resendVerification: ({ email }, o) => api.post("/auth/verify-email/resend", { email }, o),

  changePassword: ({ email, oldPassword, newPassword }, o) =>
    api.post("/auth/password/change", { email, oldPassword, newPassword }, o),

  async logout() {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
  },
};
