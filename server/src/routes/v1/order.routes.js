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
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createCheckoutSession, getStripeAvailability, resumeCheckoutSession, retryCheckoutSession } from "../../controllers/stripe.controller.js";

export const router = Router();

// 1. User Order Routes (สำคัญ: /my-orders ต้องอยู่ก่อน /:id)
router.get("/my-orders", verifyToken, getMyOrders);
router.get("/payment-options", getStripeAvailability);
router.post("/", verifyToken, createOrder);
router.post("/checkout-session", verifyToken, createCheckoutSession);
router.get("/:id/checkout-session", verifyToken, validateObjectId("id", "order ID"), resumeCheckoutSession);
router.post("/:id/checkout-session/retry", verifyToken, validateObjectId("id", "order ID"), retryCheckoutSession);
router.get("/:id", verifyToken, validateObjectId("id", "order ID"), getOrderById);

// 2. Admin Order Management Routes
router.get("/", verifyToken, requireAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, requireAdmin, validateObjectId("id", "order ID"), updateOrderStatus);

export const orderRouter = router;
export default router;
