import { Router } from "express";
import {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  updateAddress,
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../../controllers/user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getMyReviews } from "../../controllers/review.controller.js";

export const router = Router();

// Profile Routes
router.get("/profile", verifyToken, getProfile);
router.patch("/profile", verifyToken, updateProfile);
router.get("/reviews", verifyToken, getMyReviews);

// Address Routes
router.post("/address", verifyToken, addAddress);
router.patch("/address/:addressId", verifyToken, updateAddress);
router.delete("/address/:addressId", verifyToken, deleteAddress);

// Cart Routes
router.get("/cart", verifyToken, getCart);
router.post("/cart", verifyToken, addToCart);
router.patch("/cart/:itemId", verifyToken, updateCartItemQuantity);
router.delete("/cart", verifyToken, clearCart);
router.delete("/cart/:itemId", verifyToken, removeCartItem);

export const userRouter = router;
export default router;
