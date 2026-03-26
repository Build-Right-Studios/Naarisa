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