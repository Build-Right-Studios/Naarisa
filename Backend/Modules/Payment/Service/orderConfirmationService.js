import mongoose from "mongoose";
import { Order } from "../../../MongoDB/models.js";
import { confirmOrder } from "../Query/verifyPaymentQuery.js";
import { commitCouponUsage } from "../../Coupons/Query/commitCouponUsageQuery.js";
import { deductStockForItems } from "../../Variant/Service/deductStockForItemsService.js";
import { razorpay } from "../config.js";
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

// Runs fn inside a transaction; withTransaction retries transient errors (e.g. the
// write conflict when verify-payment and the webhook confirm the same order at once).
const inTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => fn(session));
  } finally {
    await session.endSession();
  }
};

const paidFields = (razorpayPaymentId) => ({
  "payment.razorpayPaymentId": razorpayPaymentId,
  "payment.status": "paid",
  "payment.paidAt": new Date(),
});

// An expired order (cancelled by cleanupPendingOrders, stock already released) whose
// payment arrived late. Re-reserve the stock and confirm it; if the stock is gone,
// refund the customer in full. The status filters make each branch run at most once.
const handleLatePayment = async (order, razorpayPaymentId) => {
  const expiredFilter = { _id: order._id, status: "cancelled", "payment.status": { $ne: "paid" } };

  let revived = null;
  try {
    revived = await inTransaction(async (session) => {
      const claimed = await Order.findOneAndUpdate(
        expiredFilter,
        {
          ...paidFields(razorpayPaymentId),
          status: "confirmed",
          $push: {
            timeline: {
              status: "confirmed",
              description: "Payment received after the order had expired; stock re-reserved",
              timestamp: new Date()
            }
          }
        },
        { returnDocument: "after", session }
      );
      if (!claimed) return null;

      await deductStockForItems(
        claimed.items.map((item) => ({ variantId: item.variant, size: item.size, quantity: item.quantity })),
        session
      );

      if (claimed.coupon?.couponId) {
        await commitCouponUsage(claimed.coupon.couponId, claimed.user, session);
      }
      return claimed;
    });
  } catch (error) {
    // 404/409 from deductStock = item deleted or out of stock → refund below
    if (error.status !== 404 && error.status !== 409) throw error;
  }

  if (revived) {
    console.log(`Late payment: order ${revived.customOrderId} revived and confirmed`);
    dispatchNotifications(revived);
    return revived;
  }

  const amount = Math.round(order.pricing.total * 100);
  const refundOrder = await Order.findOneAndUpdate(
    expiredFilter,
    {
      ...paidFields(razorpayPaymentId),
      status: "refund_initiated",
      "refund.status": "initiated",
      "refund.amount": order.pricing.total,
      $push: {
        timeline: {
          status: "refund_initiated",
          description: "Payment received after the order had expired and stock was no longer available; full refund initiated",
          timestamp: new Date()
        }
      }
    },
    { returnDocument: "after" }
  );
  if (!refundOrder) return Order.findById(order._id); // already handled by a concurrent call

  try {
    const refund = await razorpay.payments.refund(razorpayPaymentId, {
      amount,
      notes: { customOrderId: order.customOrderId, reason: "Order expired before payment; out of stock" }
    });
    console.error(`Late payment: order ${order.customOrderId} could not be revived; refund ${refund.id} initiated`);
    return Order.findByIdAndUpdate(order._id, { "refund.razorpayRefundId": refund.id }, { returnDocument: "after" });
  } catch (refundError) {
    // Money was taken but the automatic refund failed — must be refunded manually from the Razorpay dashboard.
    console.error(
      `MANUAL REFUND NEEDED: order ${order.customOrderId}, payment ${razorpayPaymentId}:`,
      refundError?.error || refundError
    );
    return Order.findByIdAndUpdate(order._id, { "refund.status": "failed" }, { returnDocument: "after" });
  }
};

/**
 * Marks an order as paid. Safe to call any number of times, from verify-payment, the
 * Razorpay webhook or the pending-order cleanup job. Returns the order's current state
 * (null only if the order doesn't exist); notifications are sent only by the call that
 * actually confirmed it.
 */
export const confirmOrderAndNotify = async (orderId, razorpayPaymentId) => {
  const confirmedOrder = await inTransaction(async (session) => {
    const order = await confirmOrder(orderId, razorpayPaymentId, session);
    if (!order) return null;

    if (order.coupon?.couponId) {
      await commitCouponUsage(order.coupon.couponId, order.user, session);
    }
    return order;
  });

  if (confirmedOrder) {
    console.log("Confirmed Order:", confirmedOrder.customOrderId);
    dispatchNotifications(confirmedOrder);
    return confirmedOrder;
  }

  // Not payment_pending any more: either already confirmed by a concurrent call, or it
  // expired before the payment arrived.
  const current = await Order.findById(orderId);
  if (current?.status === "cancelled" && current.payment.status !== "paid") {
    return handleLatePayment(current, razorpayPaymentId);
  }
  return current;
};
