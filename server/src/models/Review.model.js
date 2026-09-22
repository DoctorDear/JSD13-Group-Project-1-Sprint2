import mongoose from "mongoose";

const detailedRatingSchema = new mongoose.Schema(
  {
    comfort: { type: Number, min: 1, max: 5, default: null },
    quality: { type: Number, min: 1, max: 5, default: null },
    fit: { type: Number, min: 1, max: 5, default: null },
    length: { type: Number, min: 1, max: 5, default: null },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    detailedRatings: { type: detailedRatingSchema, default: () => ({}) },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    tags: [{ type: String, trim: true, maxlength: 32 }],
    isRecommended: { type: Boolean, default: null },
    verifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0, min: 0 },
    reportCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "published", "hidden"],
      default: "published",
    },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, rating: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);
