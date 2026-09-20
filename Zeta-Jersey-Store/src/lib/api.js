const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const REFRESH_PATH = import.meta.env.VITE_REFRESH_ENDPOINT ?? "/auth/refresh";
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

const TOKEN_KEY = "zeta.token";
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => t && localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const unauthorizedHandlers = new Set();
export function onUnauthorized(fn) {
  unauthorizedHandlers.add(fn);
  return () => unauthorizedHandlers.delete(fn);
}
function emitUnauthorized() {
  tokenStore.clear();
  unauthorizedHandlers.forEach((fn) => fn());
}

function normaliseFieldErrors(payload) {
  const raw = payload?.errors ?? payload?.fieldErrors;
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return raw.reduce((acc, e) => {
      const key = e.field ?? e.path ?? e.param;
      if (key && !acc[key]) acc[key] = e.message ?? e.msg ?? "Invalid value";
      return acc;
    }, {});
  }
  return Object.entries(raw).reduce((acc, [k, v]) => {
    acc[k] = Array.isArray(v) ? v[0] : String(v);
    return acc;
  }, {});
}

async function parseBody(res) {
  const type = res.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    try { return await res.json(); } catch { return null; }
  }
  const text = await res.text();
  return text ? { message: text } : null;
}

function defaultMessage(status) {
  if (status === 401) return "Incorrect email or password.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that resource.";
  if (status === 409) return "That account already exists.";
  if (status === 422) return "Please check the highlighted fields.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our end. Please try again shortly.";
  return "Request failed. Please try again.";
}

let refreshPromise = null;

async function refreshToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new ApiError("Session expired", { status: res.status, code: "refresh_failed" });
    }
    const data = await parseBody(res);
    const token = data?.token ?? data?.accessToken;
    tokenStore.set(token);
    return token ?? null;
  })().finally(() => { refreshPromise = null; });

  return refreshPromise;
}

export async function request(
  path,
  { method = "GET", body, signal, auth = false, headers = {}, _retried = false } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true });

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(auth && tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (res.status === 401 && auth && !_retried && path !== REFRESH_PATH) {
      clearTimeout(timer);
      try {
        await refreshToken();
      } catch {
        emitUnauthorized();
        throw new ApiError("Your session expired. Please log in again.", {
          status: 401,
          code: "session_expired",
        });
      }
      return request(path, { method, body, signal, auth, headers, _retried: true });
    }

    const payload = await parseBody(res);

    if (!res.ok) {
      throw new ApiError(payload?.message || defaultMessage(res.status), {
        status: res.status,
        code: payload?.code,
        fieldErrors: normaliseFieldErrors(payload),
      });
    }
    return payload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err?.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", { status: 0, code: "timeout" });
    }
    throw new ApiError("Network error — check your connection and try again.", {
      status: 0,
      code: "network",
    });
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: (p, o) => request(p, { ...o, method: "GET" }),
  post: (p, body, o) => request(p, { ...o, method: "POST", body }),
  patch: (p, body, o) => request(p, { ...o, method: "PATCH", body }),
  del: (p, o) => request(p, { ...o, method: "DELETE" }),
};