import jwt from 'jsonwebtoken';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Placing user order
const placeOrder = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // Validate required fields
    if (!req.body.items || !req.body.address || req.body.amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: items, address, or amount"
      });
    }

    // Calculate totals
    const shippingCharge = req.body.shippingCharge || 550;
    const totalAmount = req.body.amount + shippingCharge;

    // Generate a new order ID for MongoDB
    const orderId = new mongoose.Types.ObjectId();

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_${orderId}`,
        payment_capture: 1
      });
    } catch (razorpayError) {
      console.error("Razorpay Order Creation Error:", razorpayError);
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
        error: razorpayError.error ? razorpayError.error.description : razorpayError.message
      });
    }

    // Create new order document
    const newOrder = new orderModel({
      _id: orderId,
      userId: userId,
      items: req.body.items,
      amount: req.body.amount,
      shippingCharge: shippingCharge,
      totalAmount: totalAmount,
      address: req.body.address,
      razorpayOrderId: razorpayOrder.id
    });

    // Save order to database
    try {
      await newOrder.save();
    } catch (saveError) {
      console.error("Order Save Error:", saveError);
      return res.status(500).json({
        success: false,
        message: "Failed to save order to database",
        error: saveError.message
      });
    }

    // Clear user's cart
    try {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    } catch (cartError) {
      console.error("Cart Clear Error:", cartError);
      // Continue even if cart clearing fails
    }

    // Successful response
    res.json({
      success: true,
      orderId: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount * 100,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order",
      error: error.message 
    });
  }
};

// Payment verification
const verifyPayment = async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  try {
    // Validate input
    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment verification data" 
      });
    }

    // Generate HMAC signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Verify signature
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed: Invalid signature" 
      });
    }

    // Update order status
    await orderModel.findByIdAndUpdate(orderId, {
      payment: true,
      paymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
      status: "Order Placed"
    });

    res.json({ 
      success: true, 
      message: "Payment verified successfully" 
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error verifying payment",
      error: error.message
    });
  }
};

// Get user orders
const userOrders = async (req, res) => {
  try {
    // Extract user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token missing" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const orders = await orderModel.find({ userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User Orders Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders",
      error: error.message
    });
  }
};

// List all orders (admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List Orders Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders",
      error: error.message
    });
  }
};

// Update order status
const updateStatus = async (req, res) => {
  try {
    if (!req.body.orderId || !req.body.status) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID and status required" 
      });
    }

    await orderModel.findByIdAndUpdate(req.body.orderId, { 
      status: req.body.status 
    });
    
    res.json({ 
      success: true, 
      message: "Status Updated" 
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating status",
      error: error.message
    });
  }
};


// Cancel order and initiate refund
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Validate input
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID required" 
      });
    }

    // Extract user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token missing" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Verify user owns the order
    if (order.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to cancel this order" 
      });
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ["Cancelled", "Delivered", "Out for Delivery"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled because it's already ${order.status}` 
      });
    }

    // Initiate refund if payment was made
    let refundId = null;
    if (order.payment && order.paymentId) {
      try {
        const refund = await razorpay.payments.refund(order.paymentId, {
          amount: order.totalAmount * 100,
          speed: "normal",
        });
        refundId = refund.id;
      } catch (refundError) {
        console.error("Refund creation failed:", refundError);
        return res.status(500).json({
          success: false,
          message: "Refund initiation failed",
          error: refundError.error ? refundError.error.description : refundError.message
        });
      }
    }

    // Update order status
    order.status = "Cancelled";
    if (refundId) order.refundId = refundId;
    await order.save();

    res.json({ 
      success: true, 
      message: "Order cancelled successfully",
      refundId
    });
    
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error cancelling order",
      error: error.message
    });
  }
};

export { placeOrder, verifyPayment, userOrders, listOrders, updateStatus ,  cancelOrder };