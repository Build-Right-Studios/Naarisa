import { confirmOrder } from "../Query/verifyPaymentQuery.js";
import { sendSMS } from "../../../config/twilio.js";
import { sendSMSTemplate } from "../../../config/msg91.js";
import { sendOrderConfirmationEmail } from "../../../config/emailService.js";

// Fire-and-forget — never awaited by callers, never blocks the HTTP response
const dispatchNotifications = (confirmedOrder) => {
  const userEmail = confirmedOrder.address.email;

  // SMS
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

  // Email
  if (userEmail) {
    (async () => {
      try {
        await sendOrderConfirmationEmail(userEmail, {
          customOrderId: confirmedOrder.customOrderId,
          items: confirmedOrder.items,
          pricing: confirmedOrder.pricing,
          address: confirmedOrder.address
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    })();
  }
};

export const confirmOrderAndNotify = async (orderId, razorpayPaymentId) => {
  const confirmedOrder = await confirmOrder(orderId, razorpayPaymentId);
  console.log("Confirmed Order:", confirmedOrder.customOrderId);

  dispatchNotifications(confirmedOrder); // not awaited — runs in background

  return confirmedOrder;
};