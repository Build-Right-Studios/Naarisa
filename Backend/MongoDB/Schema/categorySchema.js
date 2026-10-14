import mongoose from "mongoose";

// Shop categories managed from the admin panel. Products link to a category by its
// `name` (Product.category stores this exact string), so `name` never changes after
// creation; `label` is what customers see and can be edited freely.
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    // Home-page "Curated Collections" tile
    image: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
    },
    // Short highlight shown next to the category in the menu, e.g. "NEW" or "DIWALI"
    badge: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },
    showOnHome: {
      type: Boolean,
      default: true,
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

export default categorySchema;
