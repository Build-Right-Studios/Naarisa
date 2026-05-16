import { existingVariantInternal } from "../Internal/existingVariantInternal.js";
import {
    getProductNameInternal,
    addNewVariantInternal
} from "../Internal/addNewVariantInternal.js";

import generateSlug from "../../../Utils/generateSlug.js";

export const addNewVariantService = async (variantData) => {

    try {

        const {
            productId,
            colorName,
            colorHex,
            images,
            sizes,
            discountPrice
        } = variantData;

        const normalizedColor = colorName.trim().toLowerCase();

        // Check duplicate variant
        const variantExists = await existingVariantInternal({
            productId,
            colorName: normalizedColor
        });

        if (variantExists) {
            throw new Error("Variant with this color already exists");
        }

        // Get product name
        const productName = await getProductNameInternal({
            productId
        });

        // Generate slug
        const slug = await generateSlug({
            productName,
            colorName: normalizedColor
        });

        const color = {
            name: normalizedColor,
            hex: colorHex
        };

        // Create variant
        const newVariant = await addNewVariantInternal({
            productId,
            color,
            images,
            sizes,
            discountPrice,
            slug
        });

        return newVariant;

    } catch (error) {

        console.log("addNewVariantService Error:", error);
        throw error;
    }
};