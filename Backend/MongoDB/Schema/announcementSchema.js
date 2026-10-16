import mongoose from "mongoose";

// Site-wide event bar shown above the storefront navbar, e.g.
// "Diwali Special — discover our new Suits collection".
const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    linkText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },
    // Site path ("/categories/suits") or full https:// URL
    link: {
      type: String,
      default: "",
      trim: true,
    },
    backgroundColor: {
      type: String,
      default: "#2B2112",
    },
    textColor: {
      type: String,
      default: "#F5E6D0",
    },
    // Optional schedule — outside this window the bar is hidden automatically
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default announcementSchema;
