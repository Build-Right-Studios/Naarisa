import mongoose from "mongoose";
import adminSchema from "./Schema/adminSchema.js";
import productSchema from "./Schema/productSchema.js";
import variantSchema from "./Schema/variantSchema.js";

const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);
const Variant = mongoose.model("Variant", variantSchema);

export { Admin, Product, Variant };