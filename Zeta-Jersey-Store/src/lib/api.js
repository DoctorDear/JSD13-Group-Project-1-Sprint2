import { normalizeApiBase, normalizeApiPath } from "./apiBase.js";

export const API_BASE_URL = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL ?? "/api",
);

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

const unauthorizedHandlers = new Set();
export function onUnauthorized(fn) {
  unauthorizedHandlers.add(fn);
  return () => unauthorizedHandlers.delete(fn);
}
function emitUnauthorized() {
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

export async function request(
  path,
  { method = "GET", body, signal, headers = {} } = {}
) {
  try {
    const cleanPath = normalizeApiPath(path);

    const res = await fetch(`${API_BASE_URL}${cleanPath}`, {
      method,
      signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const payload = await parseBody(res);

    if (!res.ok) {
      if (res.status === 401) emitUnauthorized();
      throw new ApiError(payload?.message || payload?.error || defaultMessage(res.status), {
        status: res.status,
        code: payload?.code,
        fieldErrors: normaliseFieldErrors(payload),
      });
    }
    return payload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Network error — check your connection and try again.", {
      status: 0,
      code: "network",
    });
  }
}

export const api = {
  get: (p, o) => request(p, { ...o, method: "GET" }),
  post: (p, body, o) => request(p, { ...o, method: "POST", body }),
  patch: (p, body, o) => request(p, { ...o, method: "PATCH", body }),
  del: (p, o) => request(p, { ...o, method: "DELETE" }),
};
