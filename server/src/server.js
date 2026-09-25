import express from "express";
import { connectDB } from "./config/db.js";
import apiRouter from "./routes/v1/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors.js";
import { stripeWebhook, reconcileStripeOrders } from "./controllers/stripe.controller.js";

const app = express();

app.use(cors(corsOptions));
app.post("/api/v1/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);
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
    setInterval(() => reconcileStripeOrders().catch((error) => console.error("Stripe reconciliation failed:", error)), 5 * 60 * 1000).unref();
  } catch (err) {
    console.error("Failed to start server ❌", err.message);
    process.exit(1);
  }
}

start();
