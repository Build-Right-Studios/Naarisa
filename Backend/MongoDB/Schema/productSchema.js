import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    stylingTips: {
      type: String
    },

    fabricCare: {
      type: String
    },

    category: {
      type: String,
      required: true,
      enum: ["Work", "College"],
      index: true
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