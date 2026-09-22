import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  createOrder,
} from "../../controllers/order.controller.js";
import {
  verifyToken,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

export const router = Router();

// 1. User Order Routes (สำคัญ: /my-orders ต้องอยู่ก่อน /:id)
router.get("/my-orders", verifyToken, getMyOrders);
router.post("/", verifyToken, createOrder);
router.get("/:id", verifyToken, getOrderById);

// 2. Admin Order Management Routes
router.get("/", verifyToken, requireAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);

export const orderRouter = router;
export default router;
