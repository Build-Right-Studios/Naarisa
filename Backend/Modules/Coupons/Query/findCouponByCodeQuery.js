import { Coupon } from "../../../MongoDB/models.js";

export const findCouponByCode = async (code) => {
  return await Coupon.findOne({ code: code.toUpperCase() });
};