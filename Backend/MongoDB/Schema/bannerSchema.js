import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    desktopImage: {
      type: String,    // Cloudinary URL
      required: true
    },

    mobileImage: {
      type: String,    // Cloudinary URL
      required: true
    },

    link: {
      type: String,    // where banner redirects on click
      default: null
    },

    order: {
      type: Number,    // controls display sequence
      required: true,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default bannerSchema;