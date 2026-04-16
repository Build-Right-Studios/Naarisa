import { addCouponService } from "../Service/addCouponService.js";

export const addCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, expiryDate } = req.body;

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

        if (expiryDate && new Date(expiryDate) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expiry date must be in future"
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const newCoupon = await addCouponService({ code: normalizedCode, discountType, discountValue, minOrderValue, expiryDate });

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