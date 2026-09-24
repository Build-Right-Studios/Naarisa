import mongoose from "mongoose";
import { confirmOrder } from "../Query/verifyPaymentQuery.js";
import { commitCouponUsage } from "../../Coupons/Query/commitCouponUsageQuery.js";
import { sendSMS } from "../../../config/twilio.js";
import { sendSMSTemplate } from "../../../config/msg91.js";
import { sendOrderConfirmationEmail } from "../../../config/emailService.js";
import { generatePersonalCoupon } from "../../Coupons/Service/generatePersonalCouponService.js";

// Fire-and-forget — never awaited by callers, never blocks the HTTP response
const dispatchNotifications = (confirmedOrder, personalCoupon = null) => {
  const userEmail = confirmedOrder.address.email;

  (async () => {
    try {
      if (process.env.MSG91_ORDER_CONFIRMATION_FLOW) {
        await sendSMSTemplate(
          process.env.MSG91_ORDER_CONFIRMATION_FLOW,
          confirmedOrder.address.phone,
          [confirmedOrder.customOrderId]
        );
      } else {
        await sendSMS(
          confirmedOrder.address.phone,
          `Thank you for shopping with Naarisa. Order #${confirmedOrder.customOrderId} has been confirmed. We'll notify you once it is shipped.`
        );
      }
    } catch (smsError) {
      console.error("Order Confirmation SMS failed:", smsError);
    }
  })();

  if (userEmail) {
    (async () => {
      try {
        await sendOrderConfirmationEmail(userEmail, {
          customOrderId: confirmedOrder.customOrderId,
          items: confirmedOrder.items,
          pricing: confirmedOrder.pricing,
          address: confirmedOrder.address,
          personalCoupon: personalCoupon
            ? {
                code: personalCoupon.code,
                discountValue: personalCoupon.discountValue,
                expiryDate: personalCoupon.expiryDate,
              }
            : null,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    })();
  }
};

// Shared by both confirmation paths: Razorpay-verified orders (Prepaid/PartialCOD)
// AND instantly-confirmed full-COD orders. Only Prepaid ever earns a coupon.
export const notifyOrderConfirmed = async (confirmedOrder) => {
  let personalCoupon = null;
  if (confirmedOrder.payment.mode === "Prepaid") {
    try {
      personalCoupon = await generatePersonalCoupon(confirmedOrder.user);
    } catch (err) {
      console.error("Failed to generate personal coupon:", err);
    }
  }
  dispatchNotifications(confirmedOrder, personalCoupon);
};

export const confirmOrderAndNotify = async (orderId, razorpayPaymentId) => {
  const session = await mongoose.startSession();
  let confirmedOrder;

  try {
    session.startTransaction();
    confirmedOrder = await confirmOrder(orderId, razorpayPaymentId, session);

    if (!confirmedOrder) {
      await session.abortTransaction();
      console.log(`Order ${orderId} already confirmed, skipping duplicate confirmation`);
      return null;
    }

    if (confirmedOrder.coupon?.couponId) {
      await commitCouponUsage(confirmedOrder.coupon.couponId, confirmedOrder.user, session);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  console.log("Confirmed Order:", confirmedOrder.customOrderId);
  await notifyOrderConfirmed(confirmedOrder);

  return confirmedOrder;
};