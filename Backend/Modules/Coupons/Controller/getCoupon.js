import { getCouponsService } from "../Service/getCouponsService.js";

export const getCoupon = async (req, res) => {
    try {
        const coupons = await getCouponsService();

        return res.status(200).json({
            success: true,
            count: coupons.length,
            data: coupons
        });

    } catch (error) {
        console.log("getAllActiveCoupons Error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}