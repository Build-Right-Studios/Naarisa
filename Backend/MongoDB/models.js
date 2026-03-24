import mongoose from "mongoose";
import adminSchema from "./Schema/adminSchema.js";

const Admin = mongoose.model("Admin", adminSchema);

export { Admin };