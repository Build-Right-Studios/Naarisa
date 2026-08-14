import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    default: null,
  },
  priceAtOrder: {
    type: Number,
    required: true,
  },
  returnedQuantity: {
    type: Number,
    default: 0,
  },
  productName: {
    type: String,
    required: true,
  },
  variantName: {
    type: String,
    required: true,
  },
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  customOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  items: {
    type: [orderItemSchema],
    required: true,
  },

  coupon: {
    code: String,
    discountAmount: Number,
  },

  pricing: {
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },

  // Address snapshot
  address: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, sparse: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
  },

  payment: {
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: Date,
  },

  delivery: {
    provider: {
      type: String,
      default: "shiprocket",
    },

    // Shipment
    shipmentId: String,
    shiprocketOrderId: String,

    // Courier
    courierId: Number,
    courierCode: String,
    courierName: String,
    courierType: String,
    courierRating: Number,

    courierCharge: Number,
    codCharge: Number,
    rtoCharge: Number,

    // AWB & Tracking
    awbCode: String,
    trackingNumber: String,
    trackingUrl: String,

    trackingEvents: [
      {
        status: String,
        activity: String,
        location: String,
        date: Date,
      },
    ],

    // Documents
    documents: {
      labelUrl: String,
      invoiceUrl: String,
      manifestUrl: String,
    },

    // Package Details
    package: {
      length: Number,
      breadth: Number,
      height: Number,
      weight: Number,
    },

    // Pickup
    pickupLocation: String,
    pickupId: String,

    pickupRequestedAt: Date,
    pickupScheduledAt: Date,
    pickedUpAt: Date,

    // Delivery Timeline
    estimatedDeliveryDays: Number,
    estimatedDelivery: Date,

    assignedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    returnEligibleTill: Date,

    // Sync / Webhooks
    trackingSyncedAt: Date,
    lastTrackingUpdate: Date,

    lastWebhookReceivedAt: Date,
    lastWebhookPayload: {
      type: Object,
      default: null,
    },

    // Attempts
    deliveryAttempts: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: [
        "not_dispatched",
        "shipment_created",
        "awb_generated",
        "pickup_requested",
        "pickup_scheduled",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delivery_failed",
        "rto_initiated",
        "rto_delivered",
        "returned",
        "cancelled",
      ],
      default: "not_dispatched",
    },

    // Status History
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

  // ═══════════════════════════════════════════════════════════════════════════
  // REFUND (FINAL)
  // ═══════════════════════════════════════════════════════════════════════════
  refund: {
    status: {
      type: String,
      enum: ["none", "initiated", "completed", "failed"],
      default: "none",
    },

    amount: {
      type: Number,
      default: 0,
    },

    razorpayRefundId: String,
    refundedAt: Date,
  },

  // ✅ REVERTED: Changed order_status back to status
  status: {
    type: String,
    enum: [
      "payment_pending",
      "confirmed",
      "processing",
      "packed",
      "dispatched",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "return_requested",
      "return_approved",
      "return_rejected",
      "return_received",
      "refund_initiated",
      "refund_completed",
    ],
    default: "payment_pending",
    index: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN LINKAGE
  // ═══════════════════════════════════════════════════════════════════════════
  returnRequested: {
    type: Boolean,
    default: false,
  },

  returnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Return",
    default: null,
    index: true,
  },

  timeline: [timelineSchema],

}, {
  timestamps: true,
});

export default orderSchema;