import axios from "axios";
import { Order } from "../../../MongoDB/models.js";
import { getShiprocketToken } from "../../../config/shiprocket.js";

// ======================================================
// Shiprocket Status Mapping
// ======================================================

const mapStatus = (status = "") => {
    const map = {
        pending: "shipment_created",
        ready_to_ship: "pickup_scheduled",
        pickup_scheduled: "pickup_scheduled",
        pickup_generated: "pickup_scheduled",
        pickup_queued: "pickup_scheduled",
        picked_up: "picked_up",
        shipped: "in_transit",
        in_transit: "in_transit",
        reached_destination_hub: "in_transit",
        misroute: "in_transit",
        delayed: "in_transit",
        out_for_delivery: "out_for_delivery",
        delivered: "delivered",
        undelivered: "delivery_failed",
        failed: "delivery_failed",
        cancelled: "cancelled",
        rto_initiated: "rto_initiated",
        rto_in_transit: "rto_initiated",
        rto_delivered: "rto_delivered",
        returned: "returned"
    };

    return map[status.toLowerCase()] || "in_transit";
};

// ======================================================
// Get Tracking from Shiprocket
// ======================================================

const getShiprocketTracking = async (awbCode) => {
    const token = await getShiprocketToken();

    const response = await axios.get(
        `${process.env.SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// ======================================================
// Sync Tracking
// ======================================================

export const syncOrderTracking = async (orderId) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw {
            status: 404,
            message: "Order not found",
        };
    if (!order.delivery.awbCode)
        throw {
            status: 400,
            message: "Order has no AWB.",
        };

    const tracking = await getShiprocketTracking(order.delivery.awbCode);
    const shipment = tracking?.tracking_data;
    if (!shipment)
        throw {
            status: 400,
            message: "Tracking not available.",
        };
    const trackingEvents = (shipment.shipment_track || []).map((event) => ({
        status: event.status || "Unknown",
        activity:
            event.activity ||
            event.activity_status ||
            event.status ||
            "",
        location: event.location || "",
        date: event.date ? new Date(event.date) : new Date(),
    }));

    const latestEvent =
        trackingEvents.length > 0
            ? trackingEvents[trackingEvents.length - 1]
            : null;

    const newStatus = mapStatus(shipment.shipment_status);

    order.delivery.status = newStatus;
    order.delivery.trackingEvents = trackingEvents;
    order.delivery.trackingNumber =
        shipment.awb_code ||
        shipment.awb ||
        order.delivery.trackingNumber ||
        order.delivery.awbCode;

    order.delivery.lastTrackingUpdate = new Date();
    order.delivery.estimatedDelivery =
        shipment.etd ? new Date(shipment.etd) : order.delivery.estimatedDelivery;
    switch (newStatus) {

        case "picked_up":
            order.delivery.pickedUpAt ??= new Date();
            order.status = "dispatched";
            break;

        case "in_transit":
            order.status = "dispatched";
            break;

        case "out_for_delivery":
            order.status = "out_for_delivery";
            break;

        case "delivered":
            order.delivery.deliveredAt ??= new Date();
            order.status = "delivered";
            break;

        case "cancelled":
            order.delivery.cancelledAt ??= new Date();
            order.status = "cancelled";
            break;

        case "rto_delivered":
            order.status = "return_received";
            break;
    }

    const lastHistory =
        order.delivery.statusHistory[
        order.delivery.statusHistory.length - 1
        ];

    if (!lastHistory || lastHistory.status !== newStatus) {
        order.delivery.statusHistory.push({
            status: newStatus,
            message:
                latestEvent?.activity || `Shipment ${newStatus.replaceAll("_", " ")}`,
            timestamp: new Date(),
        });
    }

    await order.save();
    return order;
};

// ======================================================
// Process Shiprocket Webhook
// ======================================================

export const processTrackingWebhook = async (payload) => {
  try {
    console.log("Processing webhook payload:", payload);

    // ✅ Extract shipment_id from webhook
    const shipmentId = payload?.data?.shipment_id;
    
    if (!shipmentId) {
      throw {
        status: 400,
        message: "Missing shipment_id in webhook",
      };
    }

    // ✅ FIND order by shipment_id (don't create new order!)
    const order = await Order.findOne({
      "delivery.shipmentId": shipmentId,
    });

    if (!order) {
      console.warn(`Order not found for shipment_id: ${shipmentId}`);
      throw {
        status: 404,
        message: `Order not found for shipment ${shipmentId}`,
      };
    }

    // ✅ Check customOrderId exists (don't let it be undefined)
    if (!order.customOrderId) {
      console.warn(`Order ${order._id} missing customOrderId`);
      throw {
        status: 400,
        message: "Order missing customOrderId",
      };
    }

    // ✅ Update tracking events
    const eventType = payload?.event_type;
    const eventData = payload?.data;

    if (eventData?.status) {
      // Update delivery status
      order.delivery.status = eventData.status;
      order.delivery.lastTrackingUpdate = new Date();

      // Add to tracking events
      if (!order.delivery.trackingEvents) {
        order.delivery.trackingEvents = [];
      }

      order.delivery.trackingEvents.push({
        status: eventData.status,
        message: eventData.message || eventData.status,
        timestamp: new Date(),
        rawData: eventData,
      });

      // Add to status history
      if (!order.delivery.statusHistory) {
        order.delivery.statusHistory = [];
      }

      order.delivery.statusHistory.push({
        status: eventData.status,
        message: eventData.message || eventData.status,
        timestamp: new Date(),
      });
    }

    // ✅ Save (customOrderId already exists, no validation error)
    await order.save();

    return {
      success: true,
      message: "Tracking updated successfully",
      orderId: order._id,
      customOrderId: order.customOrderId,
      status: order.delivery.status,
    };
  } catch (error) {
    console.error("processTrackingWebhook Error:", error);
    throw error;
  }
};