import { Order } from "../../../MongoDB/models.js";
import { sendSMSTemplate } from "../../../config/msg91.js";

const dispatchShippedSms = (order) => {
  (async () => {
    try {
      if (!process.env.MSG91_ORDER_SHIPPED_FLOW) {
        console.error("MSG91_ORDER_SHIPPED_FLOW not set — skipping shipped SMS");
        return;
      }
      await sendSMSTemplate(
        process.env.MSG91_ORDER_SHIPPED_FLOW,
        order.address.phone,
        [order.customOrderId, order.delivery.awbCode]   // ##var1## , ##var2##
      );
    } catch (smsError) {
      console.error("Order Shipped SMS failed:", order.customOrderId, smsError);
    }
  })();
};

export const markOrderShippedService = async (orderId, { trackingUrl, awbCode, courierName }) => {
  const order = await Order.findById(orderId);
  if (!order) throw { status: 404, message: "Order not found" };

  if (trackingUrl) order.delivery.trackingUrl = trackingUrl.trim();
  order.delivery.awbCode = awbCode.trim();
  if (courierName) order.delivery.courierName = courierName.trim();
  order.delivery.status = "in_transit";
  order.delivery.shippedAt = new Date();

  order.status = "dispatched";
  order.timeline.push({ status: "dispatched", timestamp: new Date() });

  await order.save();

  dispatchShippedSms(order);

  return order;
};