import { Router } from "express";
import { getProfile, updateProfile } from "../../controllers/profile.controller.js";
import { addAddress, deleteAddress, updateAddress } from "../../controllers/address.controller.js";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../../controllers/cart.controller.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../controllers/wishlist.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { getMyReviews } from "../../controllers/review.controller.js";

export const router = Router();

// Profile Routes
router.get("/profile", verifyToken, getProfile);
router.patch("/profile", verifyToken, updateProfile);
router.get("/reviews", verifyToken, getMyReviews);

// Address Routes
router.post("/address", verifyToken, addAddress);
router.patch("/address/:addressId", verifyToken, validateObjectId("addressId", "address ID"), updateAddress);
router.delete("/address/:addressId", verifyToken, validateObjectId("addressId", "address ID"), deleteAddress);

// Cart Routes
router.get("/cart", verifyToken, getCart);
router.post("/cart", verifyToken, addToCart);
router.patch("/cart/:itemId", verifyToken, validateObjectId("itemId", "cart item ID"), updateCartItemQuantity);
router.delete("/cart", verifyToken, clearCart);
router.delete("/cart/:itemId", verifyToken, validateObjectId("itemId", "cart item ID"), removeCartItem);

// Wishlist Routes
router.get("/wishlist", verifyToken, getWishlist);
router.post("/wishlist/:productId", verifyToken, validateObjectId("productId", "product ID"), addToWishlist);
router.delete("/wishlist/:productId", verifyToken, validateObjectId("productId", "product ID"), removeFromWishlist);

export const userRouter = router;
export default router;
