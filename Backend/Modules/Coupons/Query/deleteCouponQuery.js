import { Coupon } from "../../../MongoDB/models.js";

export const getCouponByIdQuery = async (id) => {
  return await Coupon.findOne({ _id: id, isDeleted: false }); // ✅ exclude soft deleted
};

export const deleteCouponQuery = async (id) => {
  return await Coupon.findByIdAndDelete(id);
};