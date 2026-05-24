import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    stylingTips: {
      type: String,
      required: true
    },

    fabricCare: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    isBestSeller: {
      type: Boolean,
      default: false,
      index: true
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },

    soldCount: {
      type: Number,
    default: 0
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export default productSchema;