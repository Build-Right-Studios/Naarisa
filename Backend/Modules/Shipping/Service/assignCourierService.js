import axios from "axios";
import { Order } from "../../../MongoDB/models.js";
import { getShiprocketToken } from "../../../config/shiprocket.js";

export const assignCourierService = async (orderId, courierId) => {
  try {
    // ✅ VALIDATION
    if (!orderId || !courierId) {
      throw {
        status: 400,
        message: "orderId and courierId are required",
      };
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw {
        status: 404,
        message: "Order not found",
      };
    }

    // ✅ Check shipmentId exists
    if (!order.delivery?.shipmentId) {
      throw {
        status: 400,
        message: "Shipment not created yet. Please create shipment first.",
      };
    }

    // ✅ Check if already assigned
    if (order.delivery?.courierName) {
      throw {
        status: 400,
        message: `Courier already assigned: ${order.delivery.courierName}`,
      };
    }

    const token = await getShiprocketToken();

    // ==========================
    // STEP 1 - Generate AWB
    // ==========================

    let awbResponse;
    try {
      awbResponse = await axios.post(
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
    } catch (error) {
      console.error("AWB Assignment Error:", error.response?.data);
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Failed to assign AWB",
      };
    }

    // ✅ Validate AWB response
    if (!awbResponse?.data?.response?.success) {
      throw {
        status: 400,
        message: awbResponse?.data?.response?.message || "AWB assignment failed",
      };
    }

    const awbCode = awbResponse.data?.response?.data?.awb_code;
    const courierName = awbResponse.data?.response?.data?.courier_name;

    if (!awbCode || !courierName) {
      throw {
        status: 400,
        message: "Invalid AWB response structure from Shiprocket",
      };
    }

    // ==========================
    // STEP 2 - Request Pickup
    // ==========================

    let pickupResponse;
    try {
      pickupResponse = await axios.post(
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
    } catch (error) {
      console.error("Pickup Request Error:", error.response?.data);
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Failed to request pickup",
      };
    }

    // ✅ Validate pickup response
    if (!pickupResponse?.data?.response?.success) {
      console.warn("Pickup request returned warning:", pickupResponse?.data?.response?.message);
      // Don't fail if pickup has warning - proceed anyway
    }

    // ==========================
    // STEP 3 - Save to Database
    // ==========================

    order.delivery.awbCode = awbCode;
    order.delivery.courierId = courierId;
    order.delivery.courierName = courierName;
    order.delivery.pickupRequested = true;
    order.delivery.pickupRequestResponse = pickupResponse.data; // ✅ Save response
    order.delivery.status = "pickup_requested"; // ✅ Status after pickup request
    order.delivery.awbAssignedAt = new Date(); // ✅ Track when assigned

    // ✅ Add to status history
    order.delivery.statusHistory.push(
      {
        status: "awb_generated",
        message: `AWB generated: ${awbCode} (${courierName})`,
        timestamp: new Date(),
      },
      {
        status: "pickup_requested",
        message: "Pickup requested from Shiprocket",
        timestamp: new Date(),
      }
    );

    await order.save();

    // ✅ Return success response
    return {
      success: true,
      message: "Courier assigned successfully",
      data: {
        orderId: order._id,
        awbCode,
        courierName,
        status: order.delivery.status,
      },
    };
  } catch (error) {
    console.error("assignCourierService Error:", error);
    throw error;
  }
};