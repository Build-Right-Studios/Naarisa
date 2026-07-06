import { Variant } from "../../../MongoDB/models.js";

export const deductStock = async (variantId, size, quantity, session) => {
  const result = await Variant.updateOne(
    { _id: variantId, "sizes.size": size, "sizes.quantity": { $gte: quantity } },
    { $inc: { "sizes.$.quantity": -quantity } },
    { session }                                        // ← added
  );
  if (result.matchedCount === 0) {
    throw { status: 409, message: "Stock changed, please try again" };
  }
  return result;
};