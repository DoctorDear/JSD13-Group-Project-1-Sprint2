import { Router } from "express";
import { router as productRoutes } from "./product.routes.js";
import { router as authRoutes } from "./auth.routes.js";
import { router as userRoutes } from "./user.routes.js";

export const routes = Router();

routes.use("/products", productRoutes);
routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
