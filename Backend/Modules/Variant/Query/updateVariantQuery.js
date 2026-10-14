import { Variant } from "../../../MongoDB/models.js";

export const updateVariantQuery = async (data) => {
    const { id, updates } = data;
    const updateVariant = await Variant.findByIdAndUpdate(
        id,
        updates,
        { returnDocument: "after" }
    );
    return updateVariant;
};