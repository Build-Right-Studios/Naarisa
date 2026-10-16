import { razorpay } from "../config.js";

/**
 * Asks Razorpay whether `razorpayPaymentId` really is a successful payment of `amount` paise
 * for `razorpayOrderId`. Signatures alone aren't enough: anyone holding the key or webhook
 * secret could sign a fake event. Returns false for unknown or mismatched payments; throws on
 * Razorpay/network errors so callers can retry.
 *
 * `allowAuthorized`: the checkout callback can arrive a moment before auto-capture completes.
 */
export const isPaymentConfirmedByRazorpay = async ({ razorpayOrderId, razorpayPaymentId, amount, allowAuthorized = false }) => {
  let payment;
  try {
    payment = await razorpay.payments.fetch(razorpayPaymentId);
  } catch (error) {
    if (error?.statusCode === 400 || error?.statusCode === 404) return false; // no such payment
    throw error;
  }

  const statusOk = payment.status === "captured" || (allowAuthorized && payment.status === "authorized");
  const matches = payment.order_id === razorpayOrderId && payment.amount === amount && statusOk;
  if (!matches) {
    console.error(
      `Razorpay check failed for payment ${razorpayPaymentId}: order ${payment.order_id}/${razorpayOrderId}, ` +
        `amount ${payment.amount}/${amount}, status ${payment.status}`
    );
  }
  return matches;
};

export const orderAmountInPaise = (order) => Math.round(order.pricing.total * 100);
