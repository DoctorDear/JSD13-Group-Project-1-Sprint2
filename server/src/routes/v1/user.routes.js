import { Router } from "express";
import {
  getProfile,
  updateProfile,
} from "../../controllers/user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router();

router.get("/profile", verifyToken, getProfile);
router.patch("/profile", verifyToken, updateProfile);