import express from "express";
import { addCoupon } from "./Controller/addCoupon.js";
import { getCoupon } from "./Controller/getCoupon.js";
import { deleteCoupon } from "./Controller/deleteCoupon.js";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { getWebsiteCoupons } from "./Controller/getWebsiteCoupons.js";

const router = express.Router();

router.post("/add-coupon", isAdmin, addCoupon);

router.get("/get-coupon", isAdmin, getCoupon);

router.get("/website-coupons", getWebsiteCoupons);

router.delete("/:id", isAdmin, deleteCoupon);



export default router;