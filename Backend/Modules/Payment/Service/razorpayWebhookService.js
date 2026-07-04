import crypto from "crypto";
import { findOrderByRazorpayOrderId } from "../Query/verifyPaymentQuery.js";
import { confirmOrderAndNotify } from "./orderConfirmationService.js";

export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
};

export const handleRazorpayWebhook = async (event) => {
  const eventType = event.event;

  // We only care about successful payment capture
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

  const order = await findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    console.error(`Webhook: no matching order for razorpayOrderId ${razorpayOrderId}`);
    return;
  }

  // Idempotency guard — if client-side verify already confirmed it, skip
  if (order.status !== "payment_pending") {
    console.log(`Webhook: order ${order.customOrderId} already in status ${order.status}, skipping`);
    return;
  }

  await confirmOrderAndNotify(order._id, razorpayPaymentId);
  console.log(`Webhook: confirmed order ${order.customOrderId}`);
};