import { Order } from "../../../MongoDB/models.js";

const STATUS_MAP = {
  // Shipment
  "AWB Assigned": "awb_generated",
  "Pickup Scheduled": "pickup_scheduled",
  "Pickup Generated": "pickup_scheduled",
  "Pickup Queued": "pickup_scheduled",

  // Pickup
  "Picked Up": "picked_up",

  // Transit
  "In Transit": "in_transit",
  "Reached Destination Hub": "in_transit",
  "Out For Delivery": "out_for_delivery",

  // Success
  Delivered: "delivered",

  // Failure
  "Delivery Failed": "delivery_failed",
  "Failed Delivery": "delivery_failed",

  // RTO
  "RTO Initiated": "rto_initiated",
  "RTO In Transit": "rto_initiated",
  "RTO Delivered": "rto_delivered",

  // Cancel
  Cancelled: "cancelled",
};

export const trackingWebhook = async (req, res) => {
  try {
    console.log("========== SHIPROCKET WEBHOOK ==========");
    console.log("JSON Body : ", JSON.stringify(req.body, null, 2));
    console.log("Req Body : ", req.body);

    const payload = req.body;

    // Shiprocket sends AWB
    const awbCode =
      payload.awb ||
      payload.awb_code ||
      payload.awbCode;

    if (!awbCode) {
      return res.status(400).json({
        success: false,
        message: "AWB not found in webhook.",
      });
    }

    const order = await Order.findOne({
      "delivery.awbCode": awbCode,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const shiprocketStatus =
      payload.current_status ||
      payload.status ||
      payload.shipment_status ||
      payload.current_status_description ||
      "Unknown";

    const internalStatus =
      STATUS_MAP[shiprocketStatus] || order.delivery.status;

    // Update delivery fields
    order.delivery.status = internalStatus;
    order.delivery.lastTrackingUpdate = new Date();
    order.delivery.lastWebhookReceivedAt = new Date();

    if (payload.tracking_url)
      order.delivery.trackingUrl = payload.tracking_url;

    if (payload.tracking_number)
      order.delivery.trackingNumber = payload.tracking_number;

    if (internalStatus === "picked_up" && !order.delivery.shippedAt) {
      order.delivery.shippedAt = new Date();
    }

    if (internalStatus === "delivered") {
      order.delivery.deliveredAt = new Date();

      // Customer gets 7 days to request return
      order.delivery.returnEligibleTill = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );
    }

    if (internalStatus === "cancelled") {
      order.delivery.cancelledAt = new Date();
    }

    // Prevent duplicate history entries
    const lastStatus =
      order.delivery.statusHistory[
        order.delivery.statusHistory.length - 1
      ];

    if (!lastStatus || lastStatus.status !== internalStatus) {
      order.delivery.statusHistory.push({
        status: internalStatus,
        message: shiprocketStatus,
        timestamp: new Date(),
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Tracking updated successfully.",
    });
  } catch (error) {
    console.error("Tracking Webhook Error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};