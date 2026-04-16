import { Coupon } from "../../../MongoDB/models.js";

export const getCouponsQuery = async () => {
  return await Coupon.find({
    isActive: true,
    expiryDate: { $gte: new Date() }
  }).sort({ createdAt: -1 });
};