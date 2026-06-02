import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default reviewSchema;