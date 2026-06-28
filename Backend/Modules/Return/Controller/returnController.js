import * as returnService from "../Services/returnService.js";

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/return/
// Create return request (customer)
// ═══════════════════════════════════════════════════════════════════════════════
export const createReturn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, reason, description, images } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!reason || !["Wrong Size", "Received Damaged Product", "Wrong Item Delivered", "Quality Issue", "Changed My Mind", "Other"].includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Valid reason is required",
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // Create return
    const newReturn = await returnService.createReturn(userId, orderId, {
      reason,
      description,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      message: "Return request created successfully",
      data: newReturn,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/return/me
// Get customer's returns
// ═══════════════════════════════════════════════════════════════════════════════
export const getMyReturns = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const returns = await returnService.getCustomerReturns(userId, { status });

    res.json({
      success: true,
      data: returns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/return/admin/dashboard
// Get all returns (admin dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllReturns = async (req, res) => {
  try {
    // Check admin (middleware handles this, but good to be explicit)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { status, reason, startDate, endDate, page, limit } = req.query;

    const result = await returnService.getAllReturns({
      status,
      reason,
      startDate,
      endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });

    res.json({
      success: true,
      data: result.returns,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/return/admin/stats
// Get return statistics
// ═══════════════════════════════════════════════════════════════════════════════
export const getStats = async (req, res) => {
  try {
    // Check admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const stats = await returnService.getReturnStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/return/admin/:id
// Get single return details (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const getReturnDetail = async (req, res) => {
  try {
    // Check admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Return ID is required",
      });
    }

    const returnRequest = await returnService.getReturnById(id);

    res.json({
      success: true,
      data: returnRequest,
    });
  } catch (error) {
    if (error.message === "Return not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/return/admin/:id/approve
// Approve return request
// ═══════════════════════════════════════════════════════════════════════════════
export const approveReturn = async (req, res) => {
  try {
    // Check admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { id } = req.params;
    const adminId = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Return ID is required",
      });
    }

    const approvedReturn = await returnService.approveReturn(id, adminId);

    res.json({
      success: true,
      message: "Return approved successfully",
      data: approvedReturn,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/return/admin/:id/reject
// Reject return request
// ═══════════════════════════════════════════════════════════════════════════════
export const rejectReturn = async (req, res) => {
  try {
    // Check admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id;

    // Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Return ID is required",
      });
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const rejectedReturn = await returnService.rejectReturn(
      id,
      adminId,
      rejectionReason
    );

    res.json({
      success: true,
      message: "Return rejected successfully",
      data: rejectedReturn,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/return/admin/:id/refund
// Process refund (Razorpay)
// ═══════════════════════════════════════════════════════════════════════════════
export const processRefund = async (req, res) => {
  try {
    // Check admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Return ID is required",
      });
    }

    const refundedReturn = await returnService.processRefund(id);

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: refundedReturn,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createReturn,
  getMyReturns,
  getAllReturns,
  getStats,
  getReturnDetail,
  approveReturn,
  rejectReturn,
  processRefund,
};