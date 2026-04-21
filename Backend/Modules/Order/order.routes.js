import express from "express";
import { placeOrder } from "./Controller/placeOrder.js";
import { getActiveOrders } from "./Controller/getActiveOrders.js";
import { getDeliveredOrders } from "./Controller/getDeliveredOrders.js";
import { getOrderById } from "./Controller/getOrderById.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/place-order", placeOrder);
// router.get("/active", protect, isAdmin, getActiveOrders);
// router.get("/delivered", protect, isAdmin, getDeliveredOrders);
// router.get("/:id", protect, isAdmin, getOrderById);

router.get("/active", getActiveOrders);
router.get("/delivered", getDeliveredOrders);
router.get("/:id", getOrderById);

export default router;