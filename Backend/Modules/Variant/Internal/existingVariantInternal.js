import { existingVariantQuery } from "../Query/existingVariantQuery.js"

export const existingVariantInternal = async (variantData) => {
    try {
        const { productId, colorName } = variantData
        const existingVariant = await existingVariantQuery({ productId, colorName });
        return existingVariant;
    } catch (error) {
        console.log("existingVariantInternal Error:", error);
        throw error;
    }
}