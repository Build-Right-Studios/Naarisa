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
    }, 
    description: {
      type: String,
      required: true
    },

    stylingTips: {
      type: String,
      required: false,
      default: ""
    },

    fabricCare: {
      type: String,
      required: true
    }, 

    returnExchange: {
      type: String,
      default: ""
    }, 

    isBestSeller: {
      type: Boolean,
      default: false
    },

    isNewArrival: {
      type: Boolean,
      default: false
    }
}, {timestamps: true});

variantSchema.index(
  { productId: 1, "color.name": 1 },
  { unique: true }
);

export default variantSchema;