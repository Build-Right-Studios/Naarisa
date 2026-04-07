export const updateVariantService = async (data) => {
  try {
    const {id, updates} = data;
    // Normalize color if updating
    if (updates.color?.name) {
      updates.color.name = updates.color.name.trim().toLowerCase();
    }

    // Validate images
    if (updates.images) {
      if (updates.images.length === 0 || updates.images.length > 4) {
        throw new Error("Images must be between 1 and 4");
      }
    }

    // Validate sizes
    if (updates.sizes) {
      if (!updates.sizes.length) {
        throw new Error("At least one size required");
      }
    }

    const updated = await updateVariantInternal({id, updates});

    if (!updated) throw new Error("Variant not found");

    return updated;
  } catch (error) {
    throw error;
  }
};