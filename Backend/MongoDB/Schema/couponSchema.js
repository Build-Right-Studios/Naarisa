import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "flat"]
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0
    },

    minOrderValue: {
      type: Number,
      default: 0,
      min: 0
    },

    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0
    },

    maxUses: {
      type: Number,
      default: null
    },

    // ✅ NEW
    usedCount: {
      type: Number,
      default: 0
    },

    // ✅ NEW
    perUserLimit: {
      type: Number,
      default: 1
    },

    couponType: {
      type: String,
      required: true,
      enum: ["website", "social"],
      default: "website"
    },

    expiryDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // ✅ Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default couponSchema;