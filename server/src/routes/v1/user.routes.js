import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
} from "../../controllers/user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/cart", verifyToken, getCart);
router.post("/cart", verifyToken, addToCart);
router.patch("/cart/:itemId", verifyToken, updateCartItemQuantity);
router.delete("/cart", verifyToken, clearCart);
router.delete("/cart/:itemId", verifyToken, removeCartItem);

export const userRouter = router;