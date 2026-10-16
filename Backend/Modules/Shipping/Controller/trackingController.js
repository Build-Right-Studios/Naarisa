import crypto from "crypto";
import { Order } from "../../../MongoDB/models.js";
import {syncOrderTracking, processTrackingWebhook} from "../Service/trackingService.js";

// ======================================================
// Get Tracking
// ======================================================

export const getTracking = async (req, res) => {
  try {

    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.delivery.status,
        awbCode: order.delivery.awbCode,
        courierName: order.delivery.courierName,
        trackingUrl: order.delivery.trackingUrl,
        estimatedDelivery:
          order.delivery.estimatedDelivery,
        trackingEvents:
          order.delivery.trackingEvents || [],
        // the admin TrackingCard reads `events`
        events:
          order.delivery.trackingEvents || [],
        statusHistory:
          order.delivery.statusHistory || [],
        lastUpdated:
          order.delivery.lastTrackingUpdate,
      },
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tracking.",
    });

  }
};

// ======================================================
// Manual Sync
// ======================================================

export const syncTracking = async (req, res) => {
  try {

    const { orderId } = req.params;

    const order =
      await syncOrderTracking(orderId);

    return res.status(200).json({
      success: true,
      message: "Tracking synced successfully.",
      data: order,
    });

  } catch (error) {

    console.error(error);

    return res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to sync tracking.",
    });

  }
};

// ======================================================
// Shiprocket Webhook
// ======================================================

// Shiprocket sends the token configured in its dashboard (Settings → API → Webhooks)
// in the x-api-key header; it must match SHIPROCKET_WEBHOOK_TOKEN.
const isValidWebhookToken = (received) => {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!expected || typeof received !== "string") return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const trackingWebhook = async (req, res) => {
  if (!isValidWebhookToken(req.headers["x-api-key"])) {
    if (!process.env.SHIPROCKET_WEBHOOK_TOKEN) console.error("Shiprocket webhook rejected: SHIPROCKET_WEBHOOK_TOKEN is not set");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const order = await processTrackingWebhook(req.body);
    // Always 200 for payloads we can't match, so Shiprocket doesn't keep retrying them
    return res.status(200).json({ success: true, matched: Boolean(order) });
  } catch (error) {
    console.error("Shiprocket webhook processing failed:", error);
    return res.status(500).json({ success: false, message: "Webhook processing failed." });
  }
};
