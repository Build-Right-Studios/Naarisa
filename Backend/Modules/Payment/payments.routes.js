import express from "express";
import { verifyPayment } from "./Controller/verifyPayment.js";
import { razorpayWebhook } from "./Controller/razorpayWebhookController.js";

const router = express.Router();

router.post("/verify-payment", verifyPayment);
router.post("/razorpay", express.raw({ type: "application/json" }), razorpayWebhook);
export default router;