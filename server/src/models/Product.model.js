import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    groupId: { type: String, default: null, trim: true }, // e.g. "LFC-2627-HOME"
    edition: { type: String, default: null }, // e.g. "Player Edition", "Stadium Edition"
    brand: { type: String, default: "Adidas", trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    tag: [{ type: String, trim: true }],
    category: { type: String, default: "Premier League" },
    fit: {
      type: String,
      enum: ["slim", "regular", "relaxed", "oversized"],
      default: null,
    },
    kitType: {
      type: String,
      enum: ["home", "away", "third", "goalkeeper", "training", "lifestyle"],
      default: null,
    },
    activity: {
      type: String,
      enum: ["football", "training", "lifestyle"],
      default: "football",
    },
    images: [{ type: String }],
    sizes: { type: [String], default: ["S", "M", "L", "XL", "2XL"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
