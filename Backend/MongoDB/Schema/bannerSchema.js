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

    desktopImageFileId: {
      type: String,
      default: null
    },

    mobileImage: {
      type: String,
      required: true
    },

    mobileImageFileId: {
      type: String,
      default: null
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