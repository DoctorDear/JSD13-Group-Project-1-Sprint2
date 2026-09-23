import { api } from "../lib/api";

const AUTH_PATH = "/v1/auth";

export const authService = {
  register: (payload, o) =>
    api.post(`${AUTH_PATH}/register`, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
    }, o),

<<<<<<< HEAD
  async login({ email, password }, o) {
    const data = await api.post(`${AUTH_PATH}/login`, { email, password }, o);
    tokenStore.set(data?.token ?? data?.accessToken);
    return data;
  },

  me: (o) => api.get(`${AUTH_PATH}/me`, { ...o, auth: true }),
=======
  login: ({ email, password }, o) => api.post("/auth/login", { email, password }, o),

  me: (o) => api.get("/auth/me", o),
>>>>>>> main

  requestPasswordReset: ({ email }, o) => api.post(`${AUTH_PATH}/password/forgot`, { email }, o),

  verifyEmail: ({ email, password }, o) => api.post(`${AUTH_PATH}/verify-email`, { email, password }, o),

  confirmEmail: ({ email, token }, o) => api.post(`${AUTH_PATH}/verify-email/confirm`, { email, token }, o),

  resendVerification: ({ email }, o) => api.post(`${AUTH_PATH}/verify-email/resend`, { email }, o),

  changePassword: ({ email, oldPassword, newPassword }, o) =>
<<<<<<< HEAD
    api.post(`${AUTH_PATH}/password/change`, { email, oldPassword, newPassword }, { ...o, auth: true }),

  async logout() {
    try { await api.post(`${AUTH_PATH}/logout`); } catch { /* ignore */ }
    tokenStore.clear();
=======
    api.post("/auth/password/change", { email, oldPassword, newPassword }, o),

  async logout() {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
>>>>>>> main
  },
};
