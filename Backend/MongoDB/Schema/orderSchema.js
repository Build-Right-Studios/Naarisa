import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true
  },
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtOrder: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  variantName: {
    type: String,
    required: true
  }
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  items: {
    type: [orderItemSchema],
    required: true
  },

  coupon: {
    code: String,
    discountAmount: Number
  },

  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },

  // Address snapshot — never reference user's live address
  address: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },

  payment: {
    razorpayOrderId: {
      type: String,
      required: true,
      index: true        // needed for webhook lookup
    },
    razorpayPaymentId: {
      type: String       // filled after payment verified
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    paidAt: Date
  },

  delivery: {
    partner: String,
    trackingId: String,
    status: {
      type: String,
      enum: [
        "not_dispatched",
        "dispatched",
        "shipped",
        "out_for_delivery",
        "delivered",
        "failed",
        "returned"
      ],
      default: "not_dispatched"
    }
  },

  status: {
    type: String,
    enum: [
      "payment_pending",
      "confirmed",
      "dispatched",
      "delivered",
      "cancelled"
    ],
    default: "payment_pending",
    index: true          // admin will filter orders by status
  },

  timeline: [timelineSchema]

}, { timestamps: true });

export default orderSchema;