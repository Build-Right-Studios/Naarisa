import crypto from "crypto";
import { Coupon } from "../../../MongoDB/models.js";

const PERSONAL_COUPON_VALUE = 100;
const PERSONAL_COUPON_VALIDITY_DAYS = 15;
const MAX_CODE_ATTEMPTS = 5;

const generateCode = () => {
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `PAY100-${suffix}`;
};

// Creates a single-use, single-customer ₹100 coupon. Retries on a code
// collision (unique index on `code`) rather than failing the whole order
// confirmation over an extremely unlikely random-string clash.
export const generatePersonalCoupon = async (userId) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + PERSONAL_COUPON_VALIDITY_DAYS);

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    try {
      return await Coupon.create({
        code: generateCode(),
        discountType: "flat",
        discountValue: PERSONAL_COUPON_VALUE,
        minOrderValue: 0,
        maxDiscountAmount: null,
        maxUses: 1,
        perUserLimit: 1,
        firstTimeUserOnly: false,
        couponType: "personal",
        assignedToUser: userId,
        expiryDate,
        isActive: true,
      });
    } catch (err) {
      if (err?.code === 11000) continue; // duplicate code, try again
      throw err;
    }
  }

  console.error("generatePersonalCoupon: exhausted retries for user", userId);
  return null;
};