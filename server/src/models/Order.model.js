import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  cartItemId: { type: mongoose.Schema.Types.ObjectId },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  edition: { type: String, default: null },
  size: { type: String, required: true },
  customName: { type: String, default: "" },
  customNumber: { type: Number, default: null },
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
      subdistrict: String,
      province: String,
      district: String,
      postalCode: String,
    },
    payment: {
      method: { type: String, default: "Cash on Delivery" },
      status: { type: String, default: "pending" },
      paidAt: { type: Date, default: null },
      transactionId: { type: String, default: "" },
      stripeSessionId: { type: String },
      reservationState: { type: String, enum: ["held", "committed", "released"], default: "committed" },
      reservationExpiresAt: { type: Date, default: null },
      cartCleared: { type: Boolean, default: false },
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

orderSchema.index({ "payment.stripeSessionId": 1 }, { unique: true, sparse: true });

export default mongoose.model("Order", orderSchema);
