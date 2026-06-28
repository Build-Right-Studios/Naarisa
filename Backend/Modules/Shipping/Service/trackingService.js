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
    const {
        awb_code,
        order_id,
        shipment_status,
        tracking_data,
    } = payload;

    const order = await Order.findOne({
        $or: [
            {
                "delivery.shiprocketOrderId": order_id,
            },
            {
                "delivery.awbCode": awb_code,
            },
        ],
    });

    if (!order)
        return {
            success: false,
            message: "Order not found",
        };

    const newStatus = mapStatus(shipment_status);

    order.delivery.status = newStatus;

    order.delivery.lastWebhookReceivedAt = new Date();

    order.delivery.lastTrackingUpdate = new Date();

    order.delivery.lastWebhookPayload = payload;

    if (tracking_data) {
        order.delivery.trackingEvents = tracking_data.map((event) => ({
            status: event.status || "",
            activity:
                event.activity ||
                event.activity_status ||
                event.status ||
                "",
            location: event.location || "",
            date: event.date ? new Date(event.date) : new Date(),
        }));
    }

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
            message: `Updated via Shiprocket Webhook`,
            timestamp: new Date(),
        });
    }

    await order.save();

    return {
        success: true,
        orderId: order._id,
        status: newStatus,
    };
};