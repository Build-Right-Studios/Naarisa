import cron from "node-cron";
import { User, Order, Variant } from "../MongoDB/models.js";

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

export const cleanupPendingOrders = () => {
  // Runs every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Fetch stale orders first to restore stock
      const staleOrders = await Order.find({
        status: "payment_pending",
        createdAt: { $lt: thirtyMinutesAgo },
      });

      if (staleOrders.length === 0) {
        console.log("No stale pending orders found");
        return;
      }

      // Restore stock for each order's items
      for (const order of staleOrders) {
        for (const item of order.items) {
          await Variant.updateOne(
            { _id: item.variant, "sizes.size": item.size },
            { $inc: { "sizes.$.quantity": item.quantity } }
          );
        }
      }

      // Now delete them
      const result = await Order.deleteMany({
        _id: { $in: staleOrders.map((o) => o._id) },
      });

      console.log(
        `Cleaned up ${result.deletedCount} stale orders, stock restored for ${staleOrders.length} orders`
      );
    } catch (error) {
      console.error("Pending order cleanup job failed:", error);
    }
  });
};