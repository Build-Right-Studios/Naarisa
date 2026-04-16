import { deleteCouponQuery, getCouponByIdQuery } from "../Query/deleteCouponQuery.js";

export const deleteCouponService = async (id) => {

  const coupon = await getCouponByIdQuery(id);

  if (!coupon) {
    throw Object.assign(new Error("Coupon not found"), {
      status: 404
    });
  }

  const deletedCoupon = await deleteCouponQuery(id);

  return deletedCoupon;
};