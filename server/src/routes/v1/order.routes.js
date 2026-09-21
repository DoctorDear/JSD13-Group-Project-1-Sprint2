import { Router } from "express";
import { getMyOrders } from "../../controllers/order.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router();

router.get("/my-orders", verifyToken, getMyOrders);
