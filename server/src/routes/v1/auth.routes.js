import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
} from "../../controllers/auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router();

// Public Routes (ใครๆ ก็เข้าถึงได้)
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected Routes (ต้องมียาม verifyToken ตรวจก่อน)
router.get("/me", verifyToken, getMe);
router.patch("/change-password", verifyToken, changePassword);
