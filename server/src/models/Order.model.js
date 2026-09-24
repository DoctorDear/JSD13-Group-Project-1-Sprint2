import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  edition: { type: String, default: null },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      recipientName: String,
      phone: String,
      addressLine: String,
      province: String,
      district: String,
      postalCode: String,
    },
    payment: {
      method: { type: String, default: "PromptPay" },
      status: { type: String, default: "completed" }, // Simulated
      paidAt: { type: Date, default: Date.now },
      transactionId: { type: String, default: "" },
    },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
