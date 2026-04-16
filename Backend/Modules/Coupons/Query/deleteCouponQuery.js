import { Coupon } from "../../../MongoDB/models.js";

export const getCouponByIdQuery = async (id) => {
  return await Coupon.findById(id);
};

export const deleteCouponQuery = async (id) => {
  return await Coupon.findByIdAndDelete(id);
};