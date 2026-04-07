export const updateVariantQuery = async (data) => {
    const { id, updates } = data;
    const updateVariant = await Variant.findByIdAndUpdate(
        id,
        updates,
        { new: true }
    );
    return updateVariant;
};