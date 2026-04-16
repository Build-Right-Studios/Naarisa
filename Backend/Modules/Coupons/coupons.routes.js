import express from "express";
import { addCoupon } from "./Controller/addCoupon.js";
import { getCoupon } from "./Controller/getCoupon.js";
import { deleteCoupon } from "./Controller/deleteCoupon.js";
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

// router.post("/add-coupon", isAdmin, addCoupon);
router.post("/add-coupon", addCoupon);
// router.get("/get-coupon", isAdmin, addCoupon);
router.get("/get-coupon", getCoupon);
// router.delete("/:id", isAdmin, deleteCoupon);
router.delete("/:id", deleteCoupon);

export default router;