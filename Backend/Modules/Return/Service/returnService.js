import Return from "../../models/Return.js";
import Order from "../../models/Order.js";
import axios from "axios";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE RETURN REQUEST
// ═══════════════════════════════════════════════════════════════════════════════
export const createReturn = async (userId, orderId, returnData) => {
  try {
    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify customer owns order
    if (order.user.toString() !== userId) {
      throw new Error("Unauthorized: Order does not belong to you");
    }

    // Check if order is returnable (delivered status)
    if (order.status !== "delivered") {
      throw new Error("Order must be delivered to initiate return");
    }

    // Check return window (7 days)
    const deliveryDate = order.delivery?.deliveredAt || order.updatedAt;
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > 7) {
      throw new Error("Return window expired (7 days from delivery)");
    }

    // ✅ ENFORCE: One return per order in service layer
    const existingReturn = await Return.findOne({ order: orderId });
    if (existingReturn) {
      throw new Error("Return already exists for this order");
    }

    // Create return request
    // ✅ returnId auto-generated via default in schema (customAlphabet)
    const newReturn = new Return({
      order: orderId,
      customer: userId,
      reason: returnData.reason,
      description: returnData.description,
      images: returnData.images || [],
    });

    // Add to status history
    newReturn.statusHistory.push({
      status: "requested",
      message: "Return request initiated by customer",
    });

    await newReturn.save();

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      returnRequested: true,
      returnId: newReturn._id,
      status: "return_requested",
    });

    return newReturn;
  } catch (error) {
    throw new Error(`Create return failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET CUSTOMER'S RETURNS
// ═══════════════════════════════════════════════════════════════════════════════
export const getCustomerReturns = async (userId, filters = {}) => {
  try {
    const query = { customer: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    const returns = await Return.find(query)
      .populate("order", "customOrderId pricing.total delivery.status")
      .populate("customer", "name email phone")
      .sort({ requestedAt: -1 });

    return returns;
  } catch (error) {
    throw new Error(`Get customer returns failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE RETURN (for detail view)
// ═══════════════════════════════════════════════════════════════════════════════
export const getReturnById = async (returnId, userId = null) => {
  try {
    const returnRequest = await Return.findById(returnId)
      .populate("order")
      .populate("customer", "name email phone")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email");

    if (!returnRequest) {
      throw new Error("Return not found");
    }

    // If userId provided, verify they own it or are admin
    if (userId && returnRequest.customer._id.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    return returnRequest;
  } catch (error) {
    throw new Error(`Get return failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL RETURNS (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllReturns = async (filters = {}) => {
  try {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.reason) {
      query.reason = filters.reason;
    }

    if (filters.startDate || filters.endDate) {
      query.requestedAt = {};
      if (filters.startDate) {
        query.requestedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.requestedAt.$lte = new Date(filters.endDate);
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const total = await Return.countDocuments(query);
    const returns = await Return.find(query)
      .populate("order", "customOrderId pricing.total")
      .populate("customer", "name email phone")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      returns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Get all returns failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// APPROVE RETURN (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════
export const approveReturn = async (returnId, adminId) => {
  try {
    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      throw new Error("Return not found");
    }

    if (returnRequest.status !== "requested") {
      throw new Error(`Cannot approve return in ${returnRequest.status} status`);
    }

    // Update return
    returnRequest.status = "approved";
    returnRequest.approvedAt = new Date();
    returnRequest.approvedBy = adminId;

    returnRequest.statusHistory.push({
      status: "approved",
      message: "Return approved by admin",
    });

    await returnRequest.save();

    // Update order
    await Order.findByIdAndUpdate(returnRequest.order, {
      status: "return_approved",
    });

    return returnRequest;
  } catch (error) {
    throw new Error(`Approve return failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REJECT RETURN (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════
export const rejectReturn = async (returnId, adminId, rejectionReason) => {
  try {
    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      throw new Error("Return not found");
    }

    if (returnRequest.status !== "requested") {
      throw new Error(`Cannot reject return in ${returnRequest.status} status`);
    }

    // Update return
    returnRequest.status = "rejected";
    returnRequest.rejectedAt = new Date();
    returnRequest.rejectedBy = adminId;
    returnRequest.rejectionReason = rejectionReason;

    returnRequest.statusHistory.push({
      status: "rejected",
      message: `Return rejected: ${rejectionReason}`,
    });

    await returnRequest.save();

    // Update order
    await Order.findByIdAndUpdate(returnRequest.order, {
      status: "return_rejected",
      returnRequested: false,
    });

    return returnRequest;
  } catch (error) {
    throw new Error(`Reject return failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESS REFUND (ADMIN) - Razorpay Integration
// ═══════════════════════════════════════════════════════════════════════════════
export const processRefund = async (returnId) => {
  try {
    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      throw new Error("Return not found");
    }

    if (returnRequest.status !== "received") {
      throw new Error(
        `Cannot refund - return must be received first (current: ${returnRequest.status})`
      );
    }

    // Get order to find Razorpay payment ID
    const order = await Order.findById(returnRequest.order);
    if (!order || !order.payment?.razorpayPaymentId) {
      throw new Error("Original payment information not found");
    }

    // Calculate refund amount (order total)
    const refundAmount = order.pricing.total;

    // Mark as refund initiated
    returnRequest.status = "refund_initiated";
    returnRequest.refund = {
      status: "initiated",
      amount: refundAmount,
    };

    returnRequest.statusHistory.push({
      status: "refund_initiated",
      message: `Refund of ₹${refundAmount} initiated`,
    });

    await returnRequest.save();

    try {
      // Create refund via Razorpay API
      const refundResponse = await axios.post(
        `https://api.razorpay.com/v1/payments/${order.payment.razorpayPaymentId}/refunds`,
        {
          amount: Math.round(refundAmount * 100), // Convert to paise
          notes: {
            returnId: returnRequest._id,
            orderId: order.customOrderId,
          },
        },
        {
          auth: {
            username: RAZORPAY_KEY_ID,
            password: RAZORPAY_KEY_SECRET,
          },
        }
      );

      // Update return with refund success
      returnRequest.status = "refunded";
      returnRequest.refund = {
        status: "completed",
        amount: refundAmount,
        razorpayRefundId: refundResponse.data.id,
        refundedAt: new Date(),
      };

      returnRequest.statusHistory.push({
        status: "refunded",
        message: `Refund completed with ID: ${refundResponse.data.id}`,
      });

      await returnRequest.save();

      // Update order refund status
      await Order.findByIdAndUpdate(returnRequest.order, {
        status: "refund_completed",
        "refund.status": "completed",
        "refund.razorpayRefundId": refundResponse.data.id,
        "refund.amount": refundAmount,
        "refund.refundedAt": new Date(),
      });

      return returnRequest;
    } catch (razorpayError) {
      // Razorpay API failed
      returnRequest.refund = {
        status: "failed",
        amount: refundAmount,
      };

      returnRequest.statusHistory.push({
        status: "refund_initiated",
        message: `Refund failed: ${razorpayError.message}`,
      });

      await returnRequest.save();

      throw new Error(`Razorpay refund failed: ${razorpayError.message}`);
    }
  } catch (error) {
    throw new Error(`Process refund failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE RETURN TRACKING (with shipmentId support)
// ═══════════════════════════════════════════════════════════════════════════════
export const updateReturnTracking = async (returnId, trackingData) => {
  try {
    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      throw new Error("Return not found");
    }

    // ✅ Support shipmentId in pickup
    returnRequest.pickup = {
      ...returnRequest.pickup,
      ...trackingData,
    };

    // If received, update status
    if (trackingData.receivedAt && returnRequest.status === "picked_up") {
      returnRequest.status = "received";
      returnRequest.statusHistory.push({
        status: "received",
        message: "Return package received",
      });
    }

    await returnRequest.save();
    return returnRequest;
  } catch (error) {
    throw new Error(`Update tracking failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET RETURN STATS (ADMIN DASHBOARD)
// ═══════════════════════════════════════════════════════════════════════════════
export const getReturnStats = async () => {
  try {
    const stats = await Return.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReturns = await Return.countDocuments();
    const totalRefunded = await Return.aggregate([
      {
        $match: { status: "refunded" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$refund.amount" },
        },
      },
    ]);

    return {
      totalReturns,
      byStatus: stats,
      totalRefunded: totalRefunded[0]?.totalAmount || 0,
    };
  } catch (error) {
    throw new Error(`Get stats failed: ${error.message}`);
  }
};

export default {
  createReturn,
  getCustomerReturns,
  getReturnById,
  getAllReturns,
  approveReturn,
  rejectReturn,
  processRefund,
  updateReturnTracking,
  getReturnStats,
};