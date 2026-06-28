import mongoose from "mongoose";
import adminSchema from "./Schema/adminSchema.js";
import productSchema from "./Schema/productSchema.js";
import variantSchema from "./Schema/variantSchema.js";
import couponSchema from "./Schema/couponSchema.js";
import userSchema from "./Schema/userSchema.js";
import orderSchema from "./Schema/orderSchema.js";
import bannerSchema from "./Schema/bannerSchema.js";
import couponUsageSchema from "./Schema/couponUsageSchema.js";
import reviewSchema from "./Schema/reviewSchema.js";
import returnSchema from "./Schema/returnSchema.js";

const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);
const Variant = mongoose.model("Variant", variantSchema);
const Coupon = mongoose.model("Coupon", couponSchema);
const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema)
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);
const Banner = mongoose.model("Banner", bannerSchema);
const Review = mongoose.model("Review", reviewSchema);
const Return = mongoose.model("Return", returnSchema);

export { Admin, Product, Variant, Coupon, CouponUsage, User, Order, Banner, Review, Return };