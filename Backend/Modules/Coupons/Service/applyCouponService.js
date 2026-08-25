import { findCouponByCode } from "../Query/findCouponByCodeQuery.js";
import { CouponUsage } from "../../../MongoDB/models.js";

export const applyCoupon = async (couponCode, subtotal, userId) => {
  let discount = 0;
  let appliedCoupon = null;

  if (!couponCode) return { discount, appliedCoupon };

  const coupon = await findCouponByCode(couponCode);

  if (!coupon) {
    throw { status: 404, message: "Invalid coupon code" };
  }

  if (!coupon.isActive || coupon.isDeleted) {
    throw { status: 400, message: "Coupon is no longer active" };
  }

  if (coupon.expiryDate < new Date()) {
    throw { status: 400, message: "Coupon has expired" };
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    throw {
      status: 400,
      message: `Minimum order amount for this coupon is ₹${coupon.minOrderValue}`
    };
  }

  // Global usage cap
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw { status: 400, message: "Coupon usage limit reached" };
  }

  // Per-user cap
  if (userId) {
    const usage = await CouponUsage.findOne({ couponId: coupon._id, userId });
    if (usage && usage.usageCount >= coupon.perUserLimit) {
      throw { status: 400, message: "You have already used this coupon the maximum number of times" };
    }
  }

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);

  appliedCoupon = {
    couponId: coupon._id,
    code: coupon.code,
    discountAmount: discount
  };

  return { discount, appliedCoupon };
};