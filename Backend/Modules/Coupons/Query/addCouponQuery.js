import { Coupon } from "../../../MongoDB/models.js";

export const addCouponQuery = async (couponData) => {
    try {
        const { code, discountType, discountValue, minOrderValue, expiryDate, couponType } = couponData;
        const newCoupon = await Coupon.create({ code, discountType, discountValue, minOrderValue, expiryDate, couponType });
        return newCoupon;
    } catch (error) {
        console.log("addCouponQuery Error : ", error)
        throw error;
    }
}

export const findCouponByCodeQuery = async (code) => {
  return await Coupon.findOne({ code: code.toUpperCase() });
};