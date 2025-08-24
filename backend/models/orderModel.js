import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  shippingCharge: { type: Number, required: true, default: 550 },
  totalAmount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Order Received" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  paymentId: { type: String, default: "" },
  razorpayOrderId: { type: String, default: "" },
  refundId: { type: String, default: "" } // New field for refund ID
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;