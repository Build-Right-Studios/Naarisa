import express from "express";
import authRoutes from "./Modules/Auth/auth.routes.js";
import userRoutes from "./Modules/User/user.routes.js";
import productRoutes from "./Modules/Product/product.routes.js";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/user", userRoutes);
router.use("/api/product", productRoutes);

export default router;