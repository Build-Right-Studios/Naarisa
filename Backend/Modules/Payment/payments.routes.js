import express from "express";
import { verifyPayment } from "./Controller/verifyPayment.js";

const router = express.Router();

router.post("/verify-payment", verifyPayment);


export default router;