import express from "express";
import authRoutes from "./Modules/Auth/auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);

export default router;