import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/order.controller.js";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";

export const router = Router();

// Admin Order Management Routes
router.get("/", verifyToken, requireAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);