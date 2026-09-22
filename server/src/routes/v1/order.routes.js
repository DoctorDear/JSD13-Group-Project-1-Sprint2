import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getOrderById, createOrder } from "../../controllers/order.controller.js";

const router = Router();

router.post("/", verifyToken, createOrder);
router.get("/:id", verifyToken, getOrderById);

export const orderRouter = router;