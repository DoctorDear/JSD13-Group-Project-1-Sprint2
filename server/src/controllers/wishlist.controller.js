import mongoose from "mongoose";
import User from "../models/User.model.js";
import { Product } from "../models/Product.model.js";

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.exists({ _id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { wishlist: productId } },
      { new: true },
    ).populate("wishlist");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { wishlist: productId } },
      { new: true },
    ).populate("wishlist");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};
