import mongoose, { Mongoose } from "mongoose";
import { sizeSchema } from "./sizeSchema.js";

const variantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true
    },
    color: {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        hex: {
            type: String,
            required: true
        }
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    images: [{
      url: String,
      public_id: String
    }],
    sizes: {
      type: [sizeSchema],
      required: true
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
}, {timestamps: true});

variantSchema.index(
  { productId: 1, "color.name": 1 },
  { unique: true }
);

export default variantSchema;