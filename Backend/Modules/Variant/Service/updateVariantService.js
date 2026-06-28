import { updateVariantInternal } from "../Internal/updateVariantInternal.js";

export const updateVariantService = async (data) => {
  try {

    const { id, updates } = data;

    // Normalize color
    if (updates.color?.name) {
      updates.color.name =
        updates.color.name.trim().toLowerCase();
    }

    // Validate images
    if (updates.images) {

      if (
        updates.images.length === 0 ||
        updates.images.length > 8
      ) {
        throw new Error(
          "Images must be between 1 and 5"
        );
      }
    }

    // Validate sizes
    if (updates.sizes) {

      if (!updates.sizes.length) {
        throw new Error(
          "At least one size required"
        );
      }
    }

    if (updates.isBestSeller !== undefined) {
      updates.isBestSeller = updates.isBestSeller === "true";
    }

    if (updates.isNewArrival !== undefined) {
      updates.isNewArrival = updates.isNewArrival === "true";
    }

    const updated = await updateVariantInternal({
      id,
      updates
    });

    if (!updated) {
      throw new Error("Variant not found");
    }

    return updated;

  } catch (error) {

    console.log(
      "updateVariantService Error:",
      error
    );

    throw error;
  }
};