import { Variant } from "../../../MongoDB/models.js";

export const deactivateVariantService = async (id) => {
  const variant = await Variant.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: "after" }
  );

  if (!variant) throw new Error("Variant not found");

  return variant;
};