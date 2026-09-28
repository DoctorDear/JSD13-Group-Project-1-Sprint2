const developmentOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
];

export const corsOptions = {
  origin: [
    ...developmentOrigins,
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()),
  ].filter(Boolean),
  credentials: true,
};
