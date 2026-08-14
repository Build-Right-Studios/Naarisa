import { deleteCouponService } from "../Service/deleteCouponService.js";

export const deleteCoupon = async (req, res) => {
  try {
    console.log("Backend Called.")
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Coupon ID is required"
      });
    }

    const deletedCoupon = await deleteCouponService(id);

    return res.status(200).json({
      success: true,
      message: `${deletedCoupon.code} Coupon Deleted`
    });

  } catch (error) {
    console.log("deleteCoupon Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};