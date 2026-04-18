import crypto from "crypto";
import { findOrderByRazorpayOrderId, confirmOrder } from "../Query/verifyPaymentQuery.js";

export const verifyPaymentService = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {

  // Step 1 — Recreate the signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // Step 2 — Compare signatures
  if (expectedSignature !== razorpaySignature) {
    throw { status: 400, message: "Invalid payment signature" };
  }

  // Step 3 — Find the order
  const order = await findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  // Step 4 — Check order isn't already confirmed
  if (order.status !== "payment_pending") {
    throw { status: 400, message: "Order already processed" };
  }

  // Step 5 — Confirm the order
  const confirmedOrder = await confirmOrder(order._id, razorpayPaymentId);

  return {
    orderId: confirmedOrder._id,
    status: confirmedOrder.status,
    paidAt: confirmedOrder.payment.paidAt
  };
};