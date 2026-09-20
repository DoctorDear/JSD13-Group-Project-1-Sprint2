import { Router } from "express";
import {
  createProductReview,
  getProductReviews,
} from "../../controllers/review.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router({ mergeParams: true });

router.get("/", getProductReviews);
router.post("/", verifyToken, createProductReview);
