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
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../controllers/user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router();

// Profile Routes
router.get("/profile", verifyToken, getProfile);
router.patch("/profile", verifyToken, updateProfile);

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

// Wishlist Routes
router.get("/wishlist", verifyToken, getWishlist);
router.post("/wishlist/:productId", verifyToken, addToWishlist);
router.delete("/wishlist/:productId", verifyToken, removeFromWishlist);

export const userRouter = router;
export default router;
