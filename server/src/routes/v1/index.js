import { Router } from "express";
import { router as productRoutes } from "./product.routes.js";
import { router as authRoutes } from "./auth.routes.js";
import { router as userRoutes } from "./user.routes.js";
import { router as reviewRoutes } from "./review.routes.js";
import { router as orderRoutes } from "./order.routes.js";

export const routes = Router();

routes.use("/products/:productId/reviews", reviewRoutes);
routes.use("/products", productRoutes);
routes.use("/auth", authRoutes);
routes.use("/orders", orderRoutes);
routes.use("/users", userRoutes);
