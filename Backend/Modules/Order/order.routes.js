import express from "express";
import { placeOrder } from "./Controller/placeOrder.js";
import { getActiveOrders } from "./Controller/getActiveOrders.js";
import { getDeliveredOrders } from "./Controller/getDeliveredOrders.js";
import { getOrderById } from "./Controller/getOrderById.js";
import { markOrderShipped } from "./Controller/markOrderShipped.js";
import { checkCodServiceability } from "./Controller/checkCodServiceability.js";
import { getOrderConfig } from "./Controller/getOrderConfig.js";
import { isUser } from "../../Middleware/isUser.js";
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

router.post("/place-order", isUser, placeOrder);

router.get("/active", isAdmin, getActiveOrders);

router.get("/delivered", isAdmin, getDeliveredOrders);

router.get("/:id", isAdmin, getOrderById);

router.patch("/:id/mark-shipped", isAdmin, markOrderShipped);

router.get("/delivery/cod-check/:pincode", checkCodServiceability);

router.get("/config", getOrderConfig);

export default router;