import express from "express";
import { connectDB } from "./config/db.js";
import { routes as apiRoutes } from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoutes);

// Centralize Error Handling Middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on ther server...",
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
