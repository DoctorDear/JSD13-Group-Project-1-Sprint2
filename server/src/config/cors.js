const developmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

/**
 * Build the deduplicated list of allowed CORS/upload origins from dev defaults and env vars.
 */
export function getAllowedOrigins(env = process.env) {
  return Array.from(
    new Set(
      [
        ...developmentOrigins,
        env.FRONTEND_URL,
        ...(env.CORS_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()),
      ].filter(Boolean),
    ),
  );
}

/**
 * Return true when the provided Origin header matches an allowed origin.
 */
export function isAllowedOrigin(origin, env = process.env) {
  return Boolean(origin) && getAllowedOrigins(env).includes(origin);
}

export const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
};
