import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getMyOrders,
} from "../../controllers/order.controller.js";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";

export const router = Router();
router.get("/my-orders", verifyToken, getMyOrders);

// Admin Order Management Routes
router.get("/", verifyToken, requireAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);
