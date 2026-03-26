import mongoose from "mongoose";
import adminSchema from "./Schema/adminSchema.js";
import productSchema from "./Schema/productSchema.js";

const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);

export { Admin, Product };