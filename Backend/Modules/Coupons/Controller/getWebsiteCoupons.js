import { Coupon, Order } from "../../../MongoDB/models.js";

export const getWebsiteCoupons = async (req, res) => {
    try {
        let hasOrders = false;

        if (req.user) {
            hasOrders = await Order.exists({
                user: req.user._id
            });
        }

        const couponFilter = {
            isActive: true,
            isDeleted: false,
            expiryDate: { $gt: new Date() },

            $and: [
                // Exclude coupons that have hit their global usage cap
                {
                    $or: [
                        { maxUses: null },
                        { $expr: { $lt: ["$usedCount", "$maxUses"] } }
                    ]
                },
                // Existing first-time-user eligibility logic
                {
                    $or: [
                        { firstTimeUserOnly: false }
                    ]
                }
            ]
        };

        if (req.user && !hasOrders) {
            couponFilter.$and[1].$or.push({
                firstTimeUserOnly: true
            });
        }

        const coupons = await Coupon.find(couponFilter)
            .select(
                "code discountType couponType discountValue minOrderValue maxDiscountAmount firstTimeUserOnly"
            );
        console.log(coupons)

        res.status(200).json({
            success: true,
            coupons
        });

    } catch (error) {
        console.error("getWebsiteCoupons Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch coupons"
        });
    }
};