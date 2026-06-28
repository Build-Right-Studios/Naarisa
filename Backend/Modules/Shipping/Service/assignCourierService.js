import axios from "axios";
import { Order } from "../../../MongoDB/models.js";
import { getShiprocketToken } from "../../../config/shiprocket.js";

export const assignCourierService = async (
  orderId,
  courierId
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw {
      status: 404,
      message: "Order not found",
    };
  }

  const token = await getShiprocketToken();

  // ==========================
  // STEP 1 - Generate AWB
  // ==========================

  const awbResponse = await axios.post(
    `${process.env.SHIPROCKET_BASE_URL}/courier/assign/awb`,
    {
      shipment_id: order.delivery.shipmentId,
      courier_id: courierId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const awbData = awbResponse.data;

  const awbCode = awbData.response.data.awb_code;
  const courierName = awbData.response.data.courier_name;

  // ==========================
  // STEP 2 - Request Pickup
  // ==========================

  const pickupResponse = await axios.post(
    `${process.env.SHIPROCKET_BASE_URL}/courier/generate/pickup`,
    {
      shipment_id: [order.delivery.shipmentId],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const pickupData = pickupResponse.data;

  // ==========================
  // STEP 3 - Save everything
  // ==========================

  order.delivery.awbCode = awbCode;
  order.delivery.courierId = courierId;
  order.delivery.courierName = courierName;
  order.delivery.pickupRequested = true;
  order.delivery.pickupRequestResponse = pickupData;
  order.delivery.status = "pickup_requested";

  order.delivery.statusHistory.push({
    status: "awb_generated",
    message: `AWB generated (${awbCode})`,
    timestamp: new Date(),
  });

  order.delivery.statusHistory.push({
    status: "pickup_requested",
    message: "Pickup requested from Shiprocket",
    timestamp: new Date(),
  });

  await order.save();

  return {
    awb: awbData,
    pickup: pickupData,
  };
};