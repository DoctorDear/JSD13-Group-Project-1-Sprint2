import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import User from "../models/User.model.js";

const DEMO_REVIEWERS = [
  { firstName: "Ploy", lastName: "S.", email: "reviewer.ploy@zeta.demo" },
  { firstName: "Tee", lastName: "K.", email: "reviewer.tee@zeta.demo" },
  { firstName: "Mint", lastName: "N.", email: "reviewer.mint@zeta.demo" },
  { firstName: "Armin", lastName: "W.", email: "reviewer.armin@zeta.demo" },
];

const REVIEW_TEMPLATES = [
  {
    rating: 5,
    title: "Exactly what I was looking for",
    body: "Excellent material quality with a comfortable fit. The details look even better in person.",
    detailedRatings: { comfort: 5, quality: 5, fit: 5, length: 5 },
    tags: ["Quality", "Comfort", "Design"],
    isRecommended: true,
  },
  {
    rating: 5,
    title: "Great match-day jersey",
    body: "Lightweight, breathable, and the sizing was accurate. I would happily buy another one.",
    detailedRatings: { comfort: 5, quality: 4, fit: 4, length: 5 },
    tags: ["Comfort", "Fit", "Material"],
    isRecommended: true,
  },
  {
    rating: 4,
    title: "Looks fantastic",
    body: "The colour and stitching are great. The fit is slightly closer than expected, so check the size guide.",
    detailedRatings: { comfort: 4, quality: 5, fit: 3, length: 4 },
    tags: ["Appearance", "Fit", "Size"],
    isRecommended: true,
  },
  {
    rating: 4,
    title: "High quality, runs a little slim",
    body: "Very well made and comfortable after a full day. I recommend sizing up if you prefer a relaxed fit.",
    detailedRatings: { comfort: 4, quality: 5, fit: 3, length: 4 },
    tags: ["Quality", "Fit", "Size"],
    isRecommended: true,
  },
];

const inferKitType = (name) => {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("away")) return "away";
  if (normalizedName.includes("third")) return "third";
  if (normalizedName.includes("goalkeeper")) return "goalkeeper";
  return "home";
};

async function getDemoUsers() {
  const password = await bcrypt.hash("DemoReview2026!", 12);

  return Promise.all(
    DEMO_REVIEWERS.map(({ firstName, lastName, email }) =>
      User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            firstName,
            lastName,
            email,
            password,
            role: "user",
          },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      ),
    ),
  );
}

async function seed() {
  await connectDB();

  try {
    const products = await Product.find({ isActive: { $ne: false } }).sort({ createdAt: 1 });
    if (!products.length) throw new Error("No active products found. Seed products before reviews.");

    const users = await getDemoUsers();
    let reviewCount = 0;

    for (const [productIndex, product] of products.entries()) {
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            fit: product.edition === "Player Edition" ? "slim" : "regular",
            kitType: inferKitType(product.name),
            activity: "football",
          },
        },
      );

      for (const [userIndex, user] of users.entries()) {
        const template = REVIEW_TEMPLATES[(productIndex + userIndex) % REVIEW_TEMPLATES.length];
        const orderNumber = `DEMO-REVIEW-${product._id.toString().slice(-6)}-${userIndex + 1}`;
        const order = await Order.findOneAndUpdate(
          { orderNumber },
          {
            $setOnInsert: {
              orderNumber,
              userId: user._id,
              items: [
                {
                  productId: product._id,
                  sku: product.sku,
                  name: product.name,
                  edition: product.edition,
                  size: product.sizes?.[0] || "M",
                  price: product.price,
                  quantity: 1,
                },
              ],
              totalAmount: product.price,
              orderStatus: "completed",
            },
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
        );

        await Review.updateOne(
          { productId: product._id, userId: user._id },
          {
            $set: {
              ...template,
              productId: product._id,
              userId: user._id,
              orderId: order._id,
              verifiedPurchase: true,
              status: "published",
              helpfulCount: userIndex,
            },
          },
          { upsert: true, runValidators: true, setDefaultsOnInsert: true },
        );
        reviewCount += 1;
      }
    }

    console.log(`Seeded ${reviewCount} demo reviews across ${products.length} products.`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error("Failed to seed demo reviews:", error.message);
  process.exitCode = 1;
});
