import { addCouponQuery, findCouponByCodeQuery } from "../Query/addCouponQuery.js";

export const addCouponService = async (couponData) => {
    const { code, discountType, discountValue, minOrderValue, expiryDate } = couponData;

    const existing = await findCouponByCodeQuery(code);
    if (existing) {
        throw new Error("Coupon already exists")
    }

    const newCoupon = await addCouponQuery(couponData);
    return newCoupon;

}