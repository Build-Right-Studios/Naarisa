import express from "express";
import { placeOrder } from "./Controller/placeOrder.js";
import { getActiveOrders } from "./Controller/getActiveOrders.js";
import { getDeliveredOrders } from "./Controller/getDeliveredOrders.js";
import { getOrderById } from "./Controller/getOrderById.js";
import { isUser } from "../../Middleware/isUser.js";

const router = express.Router();

router.post("/place-order", placeOrder);
// router.post("/place-order", isUser, placeOrder);
// router.get("/active", isAdmin, getActiveOrders);
// router.get("/delivered", isAdmin, getDeliveredOrders);
// router.get("/:id", isAdmin, getOrderById);

router.get("/active", getActiveOrders);
router.get("/delivered", getDeliveredOrders);
router.get("/:id", getOrderById);

export default router;