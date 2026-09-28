import { Router } from "express";
import { uploadImage } from "../../controllers/imageUpload.controller.js";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  handleImageUploadParseError,
  imageUploadRateLimit,
  parseImageUpload,
  validateUploadOrigin,
} from "../../middlewares/imageUpload.middleware.js";

export const router = Router();

router.post(
  "/images",
  verifyToken,
  requireAdmin,
  validateUploadOrigin,
  imageUploadRateLimit,
  parseImageUpload,
  handleImageUploadParseError,
  uploadImage,
);

export default router;
