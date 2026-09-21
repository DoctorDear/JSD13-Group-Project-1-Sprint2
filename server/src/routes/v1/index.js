import { Router } from "express";
import { router as productRoutes } from "./product.routes.js";
import { router as orderRoutes } from "./order.routes.js";

export const routes = Router();

routes.use("/products", productRoutes);
routes.use("/orders", orderRoutes);
