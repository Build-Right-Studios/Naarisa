import mongoose from "mongoose";
import adminSchema from "./Schema/adminSchema.js";
import productSchema from "./Schema/productSchema.js";
import variantSchema from "./Schema/variantSchema.js";
import couponSchema from "./Schema/couponSchema.js";
import userSchema from "./Schema/userSchema.js";
import orderSchema from "./Schema/orderSchema.js";

const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);
const Variant = mongoose.model("Variant", variantSchema);
const Coupon = mongoose.model("Coupon", couponSchema);
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);

export { Admin, Product, Variant, Coupon, User, Order };