import express from "express";
import { createShipment } from "./Controller/createShipment.js";
import { getCouriers } from "./Controller/getCouriers.js";
import { assignCourier } from "./Controller/assignCourier.js";
import { trackShipment } from "./Controller/trackShipment.js";
// import { trackingWebhook } from "./Controller/trackingWebhook.js";
import {getTracking, syncTracking, trackingWebhook} from "./Controller/trackingController.js";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { isUser } from "../../Middleware/isUser.js";

const router = express.Router();

router.post("/:orderId/create-shipment",isAdmin, createShipment);
router.get("/:orderId/track", isUser, trackShipment);
router.post("/:orderId/couriers", isAdmin, getCouriers);
router.post("/:orderId/assign-courier", isAdmin, assignCourier);


// Shiprocket Tracking Webhook
router.post("/tracking/webhook", isAdmin, trackingWebhook);

// Customer/Admin - Get tracking details
router.get("/tracking/:orderId", isAdmin, getTracking);

// Admin - Manually sync tracking from Shiprocket
router.post("/tracking/:orderId/sync", isAdmin, syncTracking);

export default router;