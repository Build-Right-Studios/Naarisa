import crypto from "crypto";
import { findOrderByRazorpayOrderId, confirmOrder } from "../Query/verifyPaymentQuery.js";
import { sendSMS } from "../../../config/twilio.js";
import { sendSMSTemplate } from "../../../config/msg91.js";
import { sendOrderConfirmationEmail } from "../../../config/emailService.js";
import { confirmOrderAndNotify } from "./orderConfirmationService.js";

export const verifyPaymentService = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  console.log("Verify Payment Service called.")

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
    if (order.status === "confirmed") {
      // console.log("Order already confirmed (likely by webhook) — returning success");
      return buildResponse(order);
    }
    // any other unexpected status (e.g. "cancelled", "failed") is a genuine problem
    throw { status: 400, message: `Order in unexpected status: ${order.status}` };
  }


  // Step 5 — Confirm the order + fire notifications in background
  const confirmedOrder = await confirmOrderAndNotify(order._id, razorpayPaymentId);
  console.log("Verify Payment Service ending.");
  return buildResponse(confirmedOrder);
};

const buildResponse = (confirmedOrder) => ({
  orderId: confirmedOrder._id,
  customOrderId: confirmedOrder.customOrderId,
  status: confirmedOrder.status,
  paidAt: confirmedOrder.payment.paidAt,
  items: confirmedOrder.items.map(item => ({
    productName: item.productName,
    variantName: item.variantName,
    size: item.size,
    quantity: item.quantity,
    priceAtOrder: item.priceAtOrder,
  })),
  pricing: {
    subtotal: confirmedOrder.pricing.subtotal,
    discount: confirmedOrder.pricing.discount,
    total: confirmedOrder.pricing.total,
  },
  address: {
    name: confirmedOrder.address.name,
    city: confirmedOrder.address.city,
    state: confirmedOrder.address.state,
  },
});