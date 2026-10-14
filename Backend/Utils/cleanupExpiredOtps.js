import cron from "node-cron";
import mongoose from "mongoose";
import { User, Order, Variant } from "../MongoDB/models.js";
import { razorpay } from "../Modules/Payment/config.js";
import { confirmOrderAndNotify } from "../Modules/Payment/Service/orderConfirmationService.js";

export const cleanupExpiredOtps = () => {
  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await User.updateMany(
        { "otp.expiresAt": { $lt: new Date() } },
        { $unset: { otp: 1 } }
      );
      console.log(`Cleaned up ${result.modifiedCount} expired OTPs`);
    } catch (error) {
      console.error("OTP cleanup job failed:", error);
    }
  });
};

// Pending orders hold reserved stock. After 30 minutes without payment, release it —
// but first ask Razorpay, so a payment whose webhook/verify call never arrived is
// confirmed instead of lost. Orders are cancelled (kept for audit), never deleted;
// a payment that arrives even later is handled by confirmOrderAndNotify.
export const expirePendingOrder = async (order) => {
  const { items: payments } = await razorpay.orders.fetchPayments(order.payment.razorpayOrderId);

  const captured = payments.find((p) => p.status === "captured");
  if (captured) {
    await confirmOrderAndNotify(order._id, captured.id);
    return "confirmed";
  }
  // Authorized but not yet captured — Razorpay will capture (or auto-refund) it; check again next run.
  if (payments.some((p) => p.status === "authorized")) return "awaiting_capture";

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const cancelled = await Order.findOneAndUpdate(
        { _id: order._id, status: "payment_pending" },
        {
          status: "cancelled",
          "payment.status": "failed",
          $push: {
            timeline: {
              status: "cancelled",
              description: "Payment not completed within 30 minutes; reserved stock released",
              timestamp: new Date(),
            },
          },
        },
        { returnDocument: "after", session }
      );
      if (!cancelled) return "skipped"; // confirmed concurrently

      for (const item of cancelled.items) {
        await Variant.updateOne(
          { _id: item.variant, "sizes.size": item.size },
          { $inc: { "sizes.$.quantity": item.quantity } },
          { session }
        );
      }
      return "cancelled";
    });
  } finally {
    await session.endSession();
  }
};

export const cleanupPendingOrders = () => {
  // Runs every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const staleOrders = await Order.find({
        status: "payment_pending",
        createdAt: { $lt: thirtyMinutesAgo },
      });

      if (staleOrders.length === 0) {
        console.log("No stale pending orders found");
        return;
      }

      const counts = {};
      for (const order of staleOrders) {
        try {
          const outcome = await expirePendingOrder(order);
          counts[outcome] = (counts[outcome] || 0) + 1;
        } catch (error) {
          // If Razorpay can't be reached, leave the order pending rather than risk cancelling a paid one.
          counts.error = (counts.error || 0) + 1;
          console.error(`Pending order cleanup failed for ${order.customOrderId}:`, error?.error || error);
        }
      }
      console.log("Pending order cleanup:", counts);
    } catch (error) {
      console.error("Pending order cleanup job failed:", error);
    }
  });
};
