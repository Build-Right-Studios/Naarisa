import express from "express";
import * as returnController from "../Controller/returnController.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/return/
// Create return request (customer)
router.post("/", createReturn);

// GET /api/return/me
// Get customer's returns
router.get("/me", returnController.getMyReturns);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/return/admin/
// Get all returns (admin dashboard)
router.get("/admin/dashboard", returnController.getAllReturns);

// GET /api/return/admin/stats
// Get return statistics
router.get("/admin/stats", returnController.getStats);

// GET /api/return/admin/:id
// Get single return details (admin)
router.get("/admin/:id", returnController.getReturnDetail);

// PUT /api/return/admin/:id/approve
// Approve return request
router.put("/admin/:id/approve", returnController.approveReturn);

// PUT /api/return/admin/:id/reject
// Reject return request
router.put("/admin/:id/reject", returnController.rejectReturn);

// PUT /api/return/admin/:id/refund
// Process refund (integrate Razorpay)
router.put("/admin/:id/refund", returnController.processRefund);

export default router;