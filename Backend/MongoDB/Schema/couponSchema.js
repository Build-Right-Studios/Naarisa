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
    }

  },
  {
    timestamps: true
  }
);

export default couponSchema;