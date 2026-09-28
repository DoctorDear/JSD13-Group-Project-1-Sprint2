import { Router } from "express";
import { router as productRoutes } from "./product.routes.js";
import { router as authRoutes } from "./auth.routes.js";
import { router as userRoutes } from "./user.routes.js";
import { router as reviewRoutes } from "./review.routes.js";
import { router as orderRoutes } from "./order.routes.js";
import { router as personalizationTemplateRoutes } from "./personalizationTemplate.routes.js";
import { router as uploadRoutes } from "./upload.routes.js";

const router = Router();

router.use("/products/:productId/reviews", reviewRoutes);
router.use("/products", productRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/personalization-templates", personalizationTemplateRoutes);
router.use("/uploads", uploadRoutes);

export const routes = router;
export default router;
