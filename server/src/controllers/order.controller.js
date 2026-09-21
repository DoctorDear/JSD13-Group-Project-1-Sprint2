import Order from "../models/Order.model.js";

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};
