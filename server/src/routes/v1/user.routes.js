import { Router } from "express";
import {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  updateAddress,
} from "../../controllers/user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router();

router.get("/profile", verifyToken, getProfile);
router.patch("/profile", verifyToken, updateProfile);
router.post("/address", verifyToken, addAddress);
router.patch("/address/:addressId", verifyToken, updateAddress);
router.delete("/address/:addressId", verifyToken, deleteAddress);