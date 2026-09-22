import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";
import Order from "../models/Order.model.js";

// Enum สถานะของออเดอร์ตาม Order Model
const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

/**
 * @desc    ดึงคำสั่งซื้อทั้งหมดในระบบ (Admin Only)
 * @route   GET /api/v1/orders
 * @access  Private (Admin)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, sort = "newest" } = req.query;

    const filter = {};
    if (status) {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed values: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
        });
      }
      filter.orderStatus = status;
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const orders = await Order.find(filter)
      .populate("userId", "firstName lastName email phone")
      .populate("items.productId", "name images price")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    อัปเดตสถานะคำสั่งซื้อ (Admin Only)
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private (Admin)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, status } = req.body;
    const targetStatus = orderStatus || status;

    // ตรวจสอบความถูกต้องของ MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // ตรวจสอบว่ามีค่าสถานะส่งมาหรือไม่
    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: "Please provide orderStatus",
      });
    }

    // ตรวจสอบว่าสถานะอยู่ใน Enum: pending, processing, shipped, completed, cancelled
    if (!ALLOWED_ORDER_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Status must be one of: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    // อัปเดตสถานะในฐานข้อมูล
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: targetStatus },
      { new: true, runValidators: true }
    )
      .populate("userId", "firstName lastName email phone")
      .populate("items.productId", "name images price");

    // กรณีไม่พบคำสั่งซื้อ
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

