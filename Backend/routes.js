import express from "express";
import authRoutes from "./Modules/Auth/auth.routes.js";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/user", userRoutes);
export default router;