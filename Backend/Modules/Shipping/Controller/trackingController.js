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

export const trackingWebhook = async (
  req,
  res
) => {
  try {

    console.log(
      "========== SHIPROCKET WEBHOOK =========="
    );

    console.log(
      JSON.stringify(req.body, null, 2)
    );

    const result =
      await processTrackingWebhook(
        req.body
      );

    return res.status(200).json(result);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Webhook processing failed.",
    });

  }
};