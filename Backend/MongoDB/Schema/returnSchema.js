import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

// ✅ Use customAlphabet for fast, collision-free ID generation
const generateReturnId = customAlphabet(
  "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  12
);

const returnSchema = new mongoose.Schema(
  {
    // ═══════════════════════════════════════════════════════════════════════════
    // LINKAGE & REFERENCE
    // ═══════════════════════════════════════════════════════════════════════════
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ IMPROVED: Use customAlphabet instead of countDocuments
    returnId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `RET-${generateReturnId()}`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // RETURN REASON & DETAILS
    // ═══════════════════════════════════════════════════════════════════════════
    reason: {
      type: String,
      required: true,
      enum: [
        "Wrong Size",
        "Received Damaged Product",
        "Wrong Item Delivered",
        "Quality Issue",
        "Changed My Mind",
        "Other",
      ],
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    images: [
      {
        type: String,
      },
    ],

    // ═══════════════════════════════════════════════════════════════════════════
    // REFUND DETAILS (IMPROVED)
    // ═══════════════════════════════════════════════════════════════════════════
    refund: {
      // ✅ ADDED: status field to track refund progress
      status: {
        type: String,
        enum: ["pending", "initiated", "completed", "failed"],
        default: "pending",
      },

      // ✅ IMPROVED: Set default value to 0
      amount: {
        type: Number,
        default: 0,
      },

      razorpayRefundId: String,
      refundedAt: Date,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // RETURN TRACKING (IMPROVED)
    // ═══════════════════════════════════════════════════════════════════════════
    pickup: {
      provider: {
        type: String,
        default: "shiprocket",
      },

      // ✅ ADDED: shipmentId for tracking return shipment
      shipmentId: String,

      pickupId: String,
      awbCode: String,
      courierName: String,
      trackingNumber: String,
      trackingUrl: String,

      scheduledAt: Date,
      pickedUpAt: Date,
      receivedAt: Date,

      events: [
        {
          status: String,
          location: String,
          activity: String,
          date: Date,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS & WORKFLOW
    // ═══════════════════════════════════════════════════════════════════════════
    status: {
      type: String,
      enum: [
        "requested",
        "approved",
        "pickup_scheduled",
        "picked_up",
        "received",
        "refund_initiated",
        "refunded",
        "rejected",
        "closed",
      ],
      default: "requested",
      index: true,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMIN ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectedAt: Date,
    rejectionReason: String,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TIMELINE
    // ═══════════════════════════════════════════════════════════════════════════
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    closedAt: Date,

    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS HISTORY
    // ═══════════════════════════════════════════════════════════════════════════
    statusHistory: [
      {
        status: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// INDEXES FOR PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════
returnSchema.index({ status: 1 });
returnSchema.index({ createdAt: -1 });
returnSchema.index({ customer: 1 });
returnSchema.index({ order: 1 });

export default returnSchema;