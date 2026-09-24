import { Router } from "express";
import {
  createProductReview,
  getReviewEligibility,
  getProductReviews,
  getMyProductReview,
  updateMyProductReview,
} from "../../controllers/review.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

export const router = Router({ mergeParams: true });

router.get("/", getProductReviews);
router.get("/eligibility", verifyToken, getReviewEligibility);
router.get("/mine", verifyToken, getMyProductReview);
router.patch("/mine", verifyToken, updateMyProductReview);
router.post("/", verifyToken, createProductReview);
