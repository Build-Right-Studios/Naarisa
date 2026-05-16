import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// VERY IMPORTANT
couponUsageSchema.index(
  { couponId: 1, userId: 1 },
  { unique: true }
);

export default couponUsageSchema;