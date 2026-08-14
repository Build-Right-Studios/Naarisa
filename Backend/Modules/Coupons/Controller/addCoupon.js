import { addCouponService } from "../Service/addCouponService.js";

export const addCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, maxUses, perUserLimit, firstTimeUserOnly, expiryDate, couponType } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon Code is required."
            })
        }

        if (!["percentage", "flat"].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount type"
            });
        }

        if (discountValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "Discount Value is required."
            })
        }

        if (minOrderValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "Min Order Value is required."
            })
        }

        if (maxDiscountAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Max Order Value is required."
            })
        }

        if (expiryDate && new Date(expiryDate) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expiry date must be in future"
            });
        }

        if (!["website", "social"].includes(couponType)) {
            return res.status(400).json({ success: false, message: "Invalid coupon type" });
        }

        if (discountType === "flat" && maxDiscountAmount) {
            return res.status(400).json({
                success: false,
                message: "Flat coupons cannot have max discount amount"
            });
        }

        if (maxUses !== undefined && Number(maxUses) < 1) {
            return res.status(400).json({
                success: false,
                message: "Max uses must be at least 1"
            });
        }

        if (perUserLimit !== undefined && Number(perUserLimit) < 1) {
            return res.status(400).json({
                success: false,
                message: "Per user limit must be at least 1"
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const newCoupon = await addCouponService({ code: normalizedCode, discountType, discountValue, minOrderValue, maxDiscountAmount, maxUses, perUserLimit, firstTimeUserOnly, expiryDate, couponType });

        return res.status(201).json({
            success: true,
            message: `${newCoupon.code} Coupon Added.`,
        })

    } catch (error) {
        console.log("addCoupon Error : ", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
}