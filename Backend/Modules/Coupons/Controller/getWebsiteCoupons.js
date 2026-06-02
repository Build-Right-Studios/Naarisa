import { Coupon } from "../../../MongoDB/models.js";

export const getWebsiteCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      couponType: "website",
      isActive: true,
      isDeleted: false,
      expiryDate: { $gt: new Date() },
    }).select("code discountType discountValue minOrderValue maxDiscountAmount");
    console.log(coupons);

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};