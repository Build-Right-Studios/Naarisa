import { Variant } from "../../../MongoDB/models.js";

export const existingVariantQuery = async (variantData) => {
    try {
        const { productId, colorName } = variantData;
        const normalizedColor = colorName.trim().toLowerCase();
        const existingVariant = await Variant.findOne({
            productId,
            "color.name": normalizedColor
        });
        return existingVariant;
    } catch (error) {
        console.log("existingVariantQuery Error:", error);
        throw error;
    }
}