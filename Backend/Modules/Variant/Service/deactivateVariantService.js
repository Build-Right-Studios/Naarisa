import { Variant } from "../../../MongoDB/models.js";

export const deactivateVariantService = async (id) => {
  const variant = await Variant.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!variant) throw new Error("Variant not found");

  return variant;
};