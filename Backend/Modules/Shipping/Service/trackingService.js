import axios from "axios";
import { Order } from "../../../MongoDB/models.js";
import { getShiprocketToken } from "../../../config/shiprocket.js";

// ======================================================
// Shiprocket Status Mapping
// ======================================================

// Shiprocket status labels (normalised: "Out For Delivery" → "out_for_delivery") → delivery.status
const LABEL_MAP = {
    awb_assigned: "awb_generated",
    pickup_generated: "pickup_scheduled",
    pickup_scheduled: "pickup_scheduled",
    pickup_queued: "pickup_scheduled",
    pickup_rescheduled: "pickup_scheduled",
    out_for_pickup: "pickup_scheduled",
    ready_to_ship: "pickup_scheduled",
    picked_up: "picked_up",
    shipped: "in_transit",
    in_transit: "in_transit",
    reached_destination_hub: "in_transit",
    reached_at_destination_hub: "in_transit",
    misrouted: "in_transit",
    delayed: "in_transit",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    undelivered: "delivery_failed",
    delivery_failed: "delivery_failed",
    canceled: "cancelled",
    cancelled: "cancelled",
    rto_initiated: "rto_initiated",
    rto_in_transit: "rto_initiated",
    rto_ndr: "rto_initiated",
    rto_ofd: "rto_initiated",
    rto_acknowledged: "rto_initiated",
    rto_delivered: "rto_delivered",
    returned: "returned",
};

// Shiprocket numeric shipment status codes, used only when there is no recognisable label
const CODE_MAP = {
    6: "in_transit",       // Shipped
    7: "delivered",
    8: "cancelled",
    9: "rto_initiated",
    10: "rto_delivered",
    17: "out_for_delivery",
    18: "in_transit",
    19: "pickup_scheduled", // Out for pickup
    21: "delivery_failed",  // Undelivered
    38: "in_transit",       // Reached destination hub
    42: "picked_up",
};

const normaliseLabel = (label) =>
    String(label ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

// Returns a delivery.status enum value, or null when the status is unknown (→ leave unchanged).
export const mapShiprocketStatus = (label, code) =>
    LABEL_MAP[normaliseLabel(label)] || CODE_MAP[Number(code)] || CODE_MAP[Number(label)] || null;

// Order statuses that tracking updates must never overwrite
const FINAL_ORDER_STATUSES = [
    "delivered", "cancelled", "return_requested", "return_approved", "return_rejected",
    "return_received", "refund_initiated", "refund_completed",
];

const STATUS_LABELS = {
    not_dispatched: "Preparing your order",
    shipment_created: "Shipment created",
    awb_generated: "Courier assigned",
    pickup_requested: "Awaiting courier pickup",
    pickup_scheduled: "Awaiting courier pickup",
    picked_up: "Picked up by courier",
    in_transit: "In transit",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    delivery_failed: "Delivery attempt failed",
    rto_initiated: "Returning to seller",
    rto_delivered: "Returned to seller",
    returned: "Returned",
    cancelled: "Shipment cancelled",
};
export const deliveryStatusLabel = (status) => STATUS_LABELS[status] || "Shipped";

// Applies a new delivery status to the order document (does not save).
const applyDeliveryStatus = (order, newStatus, message) => {
    if (!newStatus) return;

    order.delivery.status = newStatus;

    const lastHistory = order.delivery.statusHistory[order.delivery.statusHistory.length - 1];
    if (!lastHistory || lastHistory.status !== newStatus) {
        order.delivery.statusHistory.push({
            status: newStatus,
            message: message || `Shipment ${newStatus.replaceAll("_", " ")}`,
            timestamp: new Date(),
        });
    }

    // Only paid, still-active orders follow the shipment's progress
    if (order.payment?.status !== "paid" || FINAL_ORDER_STATUSES.includes(order.status)) return;

    let orderStatus = null;
    switch (newStatus) {
        case "picked_up":
        case "in_transit":
            order.delivery.pickedUpAt ??= new Date();
            orderStatus = "dispatched";
            break;
        case "out_for_delivery":
            orderStatus = "out_for_delivery";
            break;
        case "delivered":
            order.delivery.deliveredAt ??= new Date();
            orderStatus = "delivered";
            break;
        case "rto_delivered":
            orderStatus = "return_received";
            break;
        case "cancelled":
            // A cancelled *shipment* doesn't cancel a paid order — keep it visible to the admin.
            order.delivery.cancelledAt ??= new Date();
            break;
    }

    if (orderStatus && order.status !== orderStatus) {
        order.status = orderStatus;
        order.timeline.push({ status: orderStatus, description: message || "", timestamp: new Date() });
    }
};

// Shiprocket sends IST timestamps without a zone ("2023-05-19 11:59:16"); the server runs in UTC.
const parseShiprocketDate = (value) => {
    if (!value) return null;
    const text = String(value).trim();
    const date = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(text)
        ? new Date(text.replace(" ", "T") + "+05:30")
        : new Date(text);
    return isNaN(date) ? null : date;
};

const toTrackingEvents = (scans = []) =>
    (scans || []).map((scan) => ({
        status: scan["sr-status-label"] || scan.status || "Unknown",
        activity: scan.activity || scan["sr-status-label"] || scan.status || "",
        location: scan.location || "",
        date: parseShiprocketDate(scan.date) || new Date(),
    }));

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

    order.delivery.lastTrackingUpdate = new Date();
    order.delivery.trackingSyncedAt = new Date();
    if (shipment.track_url) order.delivery.trackingUrl ||= shipment.track_url;
    if (shipment.etd) order.delivery.estimatedDelivery = parseShiprocketDate(shipment.etd) || order.delivery.estimatedDelivery;

    // track_status 0 = courier has no scans yet; keep the current status
    if (shipment.track_status === 0 || shipment.error) {
        await order.save();
        return order;
    }

    const trackingEvents = toTrackingEvents(shipment.shipment_track_activities);
    if (trackingEvents.length) {
        // Shiprocket returns newest first; store oldest first
        order.delivery.trackingEvents = trackingEvents.sort((a, b) => a.date - b.date);
    }

    const label = shipment.shipment_track?.[0]?.current_status;
    const newStatus = mapShiprocketStatus(label, shipment.shipment_status);
    const latestEvent = order.delivery.trackingEvents[order.delivery.trackingEvents.length - 1];
    applyDeliveryStatus(order, newStatus, latestEvent?.activity);

    await order.save();
    return order;
};

// ======================================================
// Process Shiprocket Webhook
// ======================================================

// Returns null (and changes nothing) when the payload doesn't match one of our orders.
export const processTrackingWebhook = async (payload) => {
    const awbCode = payload?.awb ? String(payload.awb) : null;
    const srOrderId = payload?.sr_order_id ? String(payload.sr_order_id) : null;

    let order = awbCode ? await Order.findOne({ "delivery.awbCode": awbCode }) : null;
    if (!order && srOrderId) {
        order = await Order.findOne({ "delivery.shiprocketOrderId": srOrderId });
    }
    if (!order) {
        console.warn(`Shiprocket webhook: no order for awb ${awbCode} / sr_order_id ${srOrderId}`);
        return null;
    }

    order.delivery.lastTrackingUpdate = new Date();
    order.delivery.lastWebhookReceivedAt = new Date();
    order.delivery.lastWebhookPayload = payload;
    if (payload.etd) order.delivery.estimatedDelivery = parseShiprocketDate(payload.etd) || order.delivery.estimatedDelivery;

    // Each webhook carries the full scan history, so replace rather than append
    const trackingEvents = toTrackingEvents(payload.scans);
    if (trackingEvents.length) {
        order.delivery.trackingEvents = trackingEvents.sort((a, b) => a.date - b.date);
    }

    const label = payload.shipment_status || payload.current_status;
    const newStatus = mapShiprocketStatus(label, payload.shipment_status_id ?? payload.current_status_id);
    if (!newStatus) console.warn(`Shiprocket webhook: unmapped status "${label}" for ${order.customOrderId}`);
    applyDeliveryStatus(order, newStatus, payload.current_status);

    await order.save();
    console.log(`Shiprocket webhook: ${order.customOrderId} → ${order.delivery.status}`);
    return order;
};
