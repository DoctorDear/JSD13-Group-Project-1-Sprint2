import express from "express";
import { connectDB } from "./config/db.js";
import apiRouter from "./routes/v1/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// กำหนด Prefix หลักของ API
app.use("/api/v1", apiRouter);

// Centralize Error Handling Middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server...",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT} 🟢`);
    });
  } catch (err) {
    console.error("Failed to start server ❌", err.message);
    process.exit(1);
  }
}

start();