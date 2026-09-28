import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { corsOptions } from "../config/cors.js";

const developmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

export function validateUploadOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) return next();

  const allowedOrigins = new Set([
    ...developmentOrigins,
    ...(Array.isArray(corsOptions.origin) ? corsOptions.origin : []),
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()),
  ].filter(Boolean));

  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({ message: "This website is not allowed to upload images." });
  }
  return next();
}

export const imageUploadRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user.userId),
  message: { message: "Too many image uploads. Please try again in a minute." },
});

export const parseImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1, parts: 2 },
}).single("file");

export function handleImageUploadParseError(error, _req, res, _next) {
  if (!error) return;
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "Images must be 5 MB or smaller." : "Upload exactly one file and a purpose.",
    });
  }
  return res.status(400).json({ message: "Could not read the uploaded image." });
}
