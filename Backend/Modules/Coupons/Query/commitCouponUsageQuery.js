import { Coupon, CouponUsage } from "../../../MongoDB/models.js";

export const commitCouponUsage = async (couponId, userId, session) => {
  const updated = await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      $or: [
        { maxUses: null },
        { $expr: { $lt: ["$usedCount", "$maxUses"] } }
      ]
    },
    { $inc: { usedCount: 1 } },
    { new: true, session }
  );

  if (!updated) {
    console.error(`Coupon ${couponId} usage limit reached at confirmation time — order still honored`);
    return;
  }

  await CouponUsage.findOneAndUpdate(
    { couponId, userId },
    { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
    { upsert: true, session }
  );
};