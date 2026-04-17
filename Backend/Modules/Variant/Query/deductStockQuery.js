import { Variant } from "../../../MongoDB/models.js";

export const deductStock = async (variantId, size, quantity) => {
  return await Variant.updateOne(
    { _id: variantId, "sizes.size": size },
    { $inc: { "sizes.$.quantity": -quantity } }
  );
};