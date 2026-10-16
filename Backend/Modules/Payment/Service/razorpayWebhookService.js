import crypto from "crypto";
import { findOrderByRazorpayOrderId } from "../Query/verifyPaymentQuery.js";
import { confirmOrderAndNotify } from "./orderConfirmationService.js";
import { safeEqualHex } from "./verifyPaymentService.js";
import { isPaymentConfirmedByRazorpay, orderAmountInPaise } from "./razorpayPaymentCheck.js";

export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return safeEqualHex(expected, signatureHeader);
};

export const handleRazorpayWebhook = async (event) => {
  const eventType = event.event;

  if (eventType !== "payment.captured" && eventType !== "order.paid") {
    console.log(`Webhook: ignoring event type ${eventType}`);
    return;
  }

  const paymentEntity = event.payload?.payment?.entity;
  if (!paymentEntity) {
    console.warn("Webhook: no payment entity in payload", eventType);
    return;
  }

  const razorpayOrderId = paymentEntity.order_id;
  const razorpayPaymentId = paymentEntity.id;

  // Orders are never deleted any more, so no match means the payment isn't ours
  // (e.g. another integration on the same Razorpay account).
  const order = await findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    console.error(`Webhook: no matching order for razorpayOrderId ${razorpayOrderId}`);
    return;
  }

  // Don't trust the event alone (the webhook secret may be known to others) — ask Razorpay
  const captured = await isPaymentConfirmedByRazorpay({
    razorpayOrderId,
    razorpayPaymentId,
    amount: orderAmountInPaise(order),
  });
  if (!captured) {
    console.error(`Webhook: payment ${razorpayPaymentId} for ${order.customOrderId} not captured at Razorpay — ignored`);
    return;
  }

  const current = await confirmOrderAndNotify(order._id, razorpayPaymentId);
  console.log(`Webhook: processed for order ${order.customOrderId} (now ${current?.status})`);
};
