import crypto from "crypto";
import { findOrderByRazorpayOrderId, confirmOrder } from "../Query/verifyPaymentQuery.js";
import { sendSMS } from "../../../config/twilio.js";
import { sendSMSTemplate } from "../../../config/msg91.js";
import { sendOrderConfirmationEmail } from "../../../config/emailService.js";

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
    throw { status: 400, message: "Order already processed" };
  }

  // Step 5 — Confirm the order
  const confirmedOrder = await confirmOrder(order._id, razorpayPaymentId);
  console.log("Confirmed Order : ", confirmedOrder)


  // Step 6 — Get user email (populate might have it)
  const userEmail = confirmedOrder.address.email;

  // Step 7 — Send SMS
  try {
    if (process.env.MSG91_ORDER_CONFIRMATION_FLOW) {
      await sendSMSTemplate(
        process.env.MSG91_ORDER_CONFIRMATION_FLOW,
        confirmedOrder.address.phone,
        [
          confirmedOrder.customOrderId,
        ]
      );
    } else {
      // Fallback to Twilio
      await sendSMS(
        confirmedOrder.address.phone,
        `Thank you for shopping with Naarisa. Order #${confirmedOrder.customOrderId} has been confirmed. We'll notify you once it is shipped.`
      );
    }
  } catch (smsError) {
    console.error("Order Confirmation SMS failed:", smsError);
  }

  // Step 8 — Send Email
  console.log("UserEmail :", userEmail)
  if (userEmail) {
    try {
      await sendOrderConfirmationEmail(userEmail, {
        customOrderId: confirmedOrder.customOrderId,
        items: confirmedOrder.items,
        pricing: confirmedOrder.pricing,
        address: confirmedOrder.address
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't throw - SMS was already sent, payment is confirmed
    }
  }

  console.log("Verify Payment Service ending.")

  return {
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
  };
};