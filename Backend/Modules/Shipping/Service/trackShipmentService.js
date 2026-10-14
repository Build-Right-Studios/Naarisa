import { Order } from "../../../MongoDB/models.js";
import { syncOrderTracking, deliveryStatusLabel } from "./trackingService.js";

const REFRESH_AFTER_MS = 30 * 60 * 1000;
const PENDING_PICKUP = ["shipment_created", "awb_generated", "pickup_requested", "pickup_scheduled"];
const FINAL_DELIVERY = ["delivered", "rto_delivered", "returned", "cancelled"];

// Customer-facing tracking. Shipments are booked through Shiprocket, so tracking comes
// from the data kept up to date by the Shiprocket webhook / sync job; if that is stale,
// refresh it from Shiprocket first (best effort).
export const trackShipmentService = async (orderId, userId) => {
    let order = await Order.findById(orderId);
    if (!order) throw { status: 404, message: "Order not found" };
    if (userId && order.user?.toString() !== userId.toString()) {
        throw { status: 403, message: "Not authorized" };
    }

    const awb = order.delivery?.awbCode?.trim();
    if (!awb) throw { status: 400, message: "Shipment not created yet" };

    const lastUpdate = order.delivery.lastTrackingUpdate?.getTime() || 0;
    const isShiprocketShipment = Boolean(order.delivery.shipmentId);
    if (isShiprocketShipment && !FINAL_DELIVERY.includes(order.delivery.status) && Date.now() - lastUpdate > REFRESH_AFTER_MS) {
        try {
            order = await syncOrderTracking(order._id);
        } catch (error) {
            console.error(`Tracking refresh failed for ${order.customOrderId}:`, error?.message || error);
        }
    }

    const status = order.delivery.status;
    return {
        awbCode: awb,
        courierName: order.delivery.courierName || "",
        currentStatus: status,
        currentStatusText: deliveryStatusLabel(status),
        isPendingPickup: PENDING_PICKUP.includes(status),
        trackingUrl: order.delivery.trackingUrl || "",
        estimatedDelivery: order.delivery.estimatedDelivery || null,
        scans: (order.delivery.trackingEvents || []).map((event) => ({
            date: event.date
                ? new Date(event.date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
                : "",
            status: event.activity || event.status || "",
            location: event.location || "",
        })),
    };
};
