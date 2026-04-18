import { findCouponByCode } from "../Query/findCouponByCodeQuery.js" 

export const applyCoupon = async (couponCode, subtotal) => {
  let discount = 0;
  let appliedCoupon = null;

  if (!couponCode) return { discount, appliedCoupon };

  const coupon = await findCouponByCode(couponCode);

  if (!coupon) {
    throw { status: 404, message: "Invalid coupon code" };
  }

  if (!coupon.isActive) {
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

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  // Discount can never exceed subtotal
  discount = Math.min(discount, subtotal);

  appliedCoupon = {
    code: coupon.code,
    discountAmount: discount
  };

  return { discount, appliedCoupon };
};