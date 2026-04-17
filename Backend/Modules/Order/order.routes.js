import express from "express";
import { placeOrder } from "./Controller/placeOrder.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/place-order", placeOrder);

export default router;