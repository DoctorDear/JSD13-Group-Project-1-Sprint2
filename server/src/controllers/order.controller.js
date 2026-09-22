import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";

// 1. ฟังก์ชันดูรายละเอียดออเดอร์เดี่ยว
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner = order.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// 2. ฟังก์ชันสร้างออเดอร์ใหม่ (Checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress } = req.body;
    const user = await User.findById(userId).populate("cart.productId");

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of user.cart) {
      // ป้องกันกรณี item.productId เป็น null หรือ undefined
      const prodId =
        item.productId && item.productId._id
          ? item.productId._id
          : item.productId;

      if (!prodId) {
        return res.status(400).json({
          success: false,
          message: "Invalid product reference in cart",
        });
      }

      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        size: item.size || product.size,
        quantity: item.quantity,
      });
    }

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const orderNumber = `ZT-${Date.now()}`;

    const newOrder = await Order.create({
      userId,
      orderNumber,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    user.cart = [];
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Enum สถานะของออเดอร์ตาม Order Model
const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

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
      { new: true, runValidators: true },
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
