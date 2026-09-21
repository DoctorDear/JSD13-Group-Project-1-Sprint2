import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";

const MAX_PAGE_SIZE = 50;
const RATING_FIELDS = ["comfort", "quality", "fit", "length"];

const isValidProductId = (value) => mongoose.Types.ObjectId.isValid(value);

const serializeReview = (review) => {
  const reviewer = review.userId;
  const reviewerName = reviewer
    ? [reviewer.firstName, reviewer.lastName].filter(Boolean).join(" ")
    : "Zeta customer";

  return {
    id: review._id,
    rating: review.rating,
    detailedRatings: review.detailedRatings,
    title: review.title,
    body: review.body,
    tags: review.tags,
    isRecommended: review.isRecommended,
    verifiedPurchase: review.verifiedPurchase,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt,
    reviewer: {
      name: reviewerName,
      initials: reviewerName
        .split(" ")
        .filter(Boolean)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
  };
};

const cleanDetailedRatings = (ratings = {}) => {
  const result = {};

  for (const field of RATING_FIELDS) {
    const value = ratings[field];
    if (value === undefined || value === null || value === "") continue;

    const score = Number(value);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return { error: `${field} must be an integer from 1 to 5` };
    }
    result[field] = score;
  }

  return { value: result };
};

const cleanTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 10);
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidProductId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );
    const rating = Number.parseInt(req.query.rating, 10);
    const filter = { productId, status: "published" };

    if (req.query.rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "rating must be a number from 1 to 5" });
    }
    if (rating) filter.rating = rating;

    const requestedTags = String(req.query.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (requestedTags.length) filter.tags = { $in: requestedTags };

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
      helpful: { helpfulCount: -1, createdAt: -1 },
    };
    const sort = sortOptions[req.query.sort] || sortOptions.newest;

    const summaryFilter = {
      productId: new mongoose.Types.ObjectId(productId),
      status: "published",
    };
    const [reviews, total, summaryRows, distribution, tagRows] = await Promise.all([
      Review.find(filter)
        .populate("userId", "firstName lastName")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: summaryFilter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            recommendRate: { $avg: { $cond: [{ $eq: ["$isRecommended", true] }, 1, 0] } },
            comfort: { $avg: "$detailedRatings.comfort" },
            quality: { $avg: "$detailedRatings.quality" },
            fit: { $avg: "$detailedRatings.fit" },
            length: { $avg: "$detailedRatings.length" },
          },
        },
      ]),
      Review.aggregate([
        { $match: summaryFilter },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
      Review.aggregate([
        { $match: summaryFilter },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    const summary = summaryRows[0] || {
      count: 0,
      averageRating: 0,
      recommendRate: 0,
      comfort: null,
      quality: null,
      fit: null,
      length: null,
    };

    return res.status(200).json({
      reviews: reviews.map(serializeReview),
      summary: {
        count: summary.count,
        averageRating: Number(summary.averageRating?.toFixed(1) || 0),
        recommendRate: Math.round((summary.recommendRate || 0) * 100),
        detailedRatings: Object.fromEntries(
          RATING_FIELDS.map((field) => [
            field,
            summary[field] ? Number(summary[field].toFixed(1)) : null,
          ]),
        ),
        distribution: Object.fromEntries(distribution.map((item) => [item._id, item.count])),
        tags: tagRows.map((item) => ({ name: item._id, count: item.count })),
      },
      pagination: {
        page,
        limit,
        total,
        pageCount: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidProductId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be an integer from 1 to 5" });
    }

    const body = String(req.body.body || "").trim();
    if (!body) {
      return res.status(400).json({ message: "Review text is required" });
    }

    const { value: detailedRatings, error } = cleanDetailedRatings(req.body.detailedRatings);
    if (error) return res.status(400).json({ message: error });

    const [product, existingReview, order] = await Promise.all([
      Product.exists({ _id: productId, isActive: true }),
      Review.exists({ productId, userId: req.user.userId }),
      Order.findOne({
        userId: req.user.userId,
        orderStatus: { $in: ["processing", "shipped", "completed"] },
        "items.productId": productId,
      }).sort({ createdAt: -1 }),
    ]);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this product" });
    }
    if (!order) {
      return res.status(403).json({ message: "Only verified purchasers can review this product" });
    }

    const review = await Review.create({
      productId,
      userId: req.user.userId,
      orderId: order._id,
      rating,
      detailedRatings,
      title: String(req.body.title || "").trim(),
      body,
      tags: cleanTags(req.body.tags),
      isRecommended:
        typeof req.body.isRecommended === "boolean" ? req.body.isRecommended : null,
      verifiedPurchase: true,
    });

    await review.populate("userId", "firstName lastName");
    return res.status(201).json({ review: serializeReview(review) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this product" });
    }
    next(err);
  }
};
