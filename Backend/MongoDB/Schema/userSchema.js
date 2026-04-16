import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: {
    type: String,  // "Home", "Work", "Other"
    default: "Home"
  },
  name: String,
  phone: String,
  line1: String,
  line2: String,   // optional
  city: String,
  state: String,
  pincode: String,
  isDefault: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    sparse: true    // optional but unique if provided
  },
  addresses: [addressSchema],

  otp: {
    code: String,
    expiresAt: Date
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default userSchema;