import express from "express";
import { createShipment } from "./Controller/createShipment.js";
import { getCouriers } from "./Controller/getCouriers.js";
import { assignCourier } from "./Controller/assignCourier.js";
// import { trackingWebhook } from "./Controller/trackingWebhook.js";
import {getTracking, syncTracking, trackingWebhook} from "./Controller/trackingController.js";

const router = express.Router();

router.post("/:orderId/create-shipment", createShipment);
// router.post("/tracking", trackingWebhook);
router.post("/:orderId/couriers", getCouriers);
router.post("/:orderId/assign-courier", assignCourier);

// Customer/Admin - Get tracking details
router.get("/tracking/:orderId", getTracking);

// Admin - Manually sync tracking from Shiprocket
router.post("/tracking/:orderId/sync", syncTracking);

// Shiprocket Tracking Webhook
router.post("/tracking/webhook", trackingWebhook);

export default router;