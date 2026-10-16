import crypto from "crypto";
import { findOrderByRazorpayOrderId } from "../Query/verifyPaymentQuery.js";
import { confirmOrderAndNotify } from "./orderConfirmationService.js";
import { isPaymentConfirmedByRazorpay, orderAmountInPaise } from "./razorpayPaymentCheck.js";

export const safeEqualHex = (a, b) => {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export const verifyPaymentService = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  // Step 1 — Recreate the signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // Step 2 — Compare signatures
  if (!safeEqualHex(expectedSignature, razorpaySignature)) {
    throw { status: 400, message: "Invalid payment signature" };
  }

  // Step 3 — Find the order
  const order = await findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  // Step 4 — Make sure Razorpay really has this payment for this order and amount
  const confirmedByRazorpay = await isPaymentConfirmedByRazorpay({
    razorpayOrderId,
    razorpayPaymentId,
    amount: orderAmountInPaise(order),
    allowAuthorized: true,
  });
  if (!confirmedByRazorpay) {
    throw {
      status: 400,
      message: "We couldn't confirm your payment yet. If you were charged, your order will be confirmed automatically within a few minutes."
    };
  }

  // Step 5 — Confirm (idempotent: a no-op if the webhook already confirmed it, and
  // handles payments that arrive after the order expired)
  const current = await confirmOrderAndNotify(order._id, razorpayPaymentId);

  if (current?.status === "refund_initiated") {
    throw {
      status: 409,
      message: "Your payment was received after the order expired and the items are no longer in stock. A full refund has been initiated."
    };
  }
  if (!current || current.payment.status !== "paid") {
    throw { status: 400, message: `Order in unexpected status: ${current?.status}` };
  }

  return buildResponse(current);
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
