import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    desktopImage: {
      type: String,
      required: true
    },

    mobileImage: {
      type: String,
      required: true
    },

    link: {
      type: String,
      default: null
    },

    order: {
      type: Number,
      required: true,
      default: 0
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

export default bannerSchema;