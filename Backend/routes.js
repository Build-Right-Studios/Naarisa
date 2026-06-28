import express from "express";
import authRoutes from "./Modules/Auth/auth.routes.js";
import userRoutes from "./Modules/User/user.routes.js";
import productRoutes from "./Modules/Product/product.routes.js";
import variantRoutes from "./Modules/Variant/variant.routes.js";
import orderRoutes from "./Modules/Order/order.routes.js";
import couponsRoutes from "./Modules/Coupons/coupons.routes.js";
import bannerRoutes from "./Modules/Banners/banners.routes.js";
import paymentRoutes from "./Modules/Payment/payments.routes.js";
import contactRoute from "./Modules/Contact/contact.routes.js";
import shipmentRoutes from "./Modules/Shipping/shipment.routes.js";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/user", userRoutes);
router.use("/api/product", productRoutes);
router.use("/api/variant", variantRoutes);
router.use("/api/order", orderRoutes);
router.use("/api/coupons", couponsRoutes);
router.use("/api/banners", bannerRoutes);
router.use("/api/payment", paymentRoutes);
router.use("/api/contact", contactRoute);
router.use("/api/shipment", shipmentRoutes);

export default router;