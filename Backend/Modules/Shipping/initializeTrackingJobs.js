import cron from "node-cron";
import { Order } from "../../MongoDB/models.js";
import { syncOrderTracking } from "./Service/trackingService.js";

// ═══════════════════════════════════════════════════════════════════════════════
// Start tracking sync cron - runs every 30 minutes
// ═══════════════════════════════════════════════════════════════════════════════
export const startTrackingCron = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      console.log("🔄 [Tracking Sync] Starting...");

      // Paid Shiprocket shipments that are still moving (the webhook is the primary
      // source; this catches anything it missed)
      const activeOrders = await Order.find({
        "payment.status": "paid",
        "delivery.shipmentId": { $nin: [null, ""] },
        "delivery.awbCode": { $nin: [null, ""] },
        "delivery.status": {
          $nin: ["delivered", "cancelled", "returned", "rto_delivered"],
        },
      }).select("_id");

      console.log(`📦 Found ${activeOrders.length} active orders`);

      let syncedCount = 0;
      let failedCount = 0;

      // Sync each order
      for (const order of activeOrders) {
        try {
          await syncOrderTracking(order._id);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Failed to sync ${order._id}: ${error.message}`);
          failedCount++;
        }
      }

      console.log(
        `✅ [Tracking Sync] Complete - Synced: ${syncedCount}, Failed: ${failedCount}`
      );
    } catch (error) {
      console.error("❌ [Tracking Sync] Error:", error.message);
    }
  });

  console.log("✓ Tracking cron job started (every 30 minutes)");
};

export default {
  startTrackingCron,
};