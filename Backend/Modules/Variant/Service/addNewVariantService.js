import { existingVariantInternal } from "../Internal/existingVariantInternal.js";
import { getProductNameInternal, addNewVariantInternal } from "../Internal/addNewVariantInternal.js"
import generateSlug from "../../../Utils/generateSlug.js";

export const addNewVariantService = async (variantData) => {
    try {
        const { productId, color, images, sizes, discountPrice } = variantData;

        const normalizedColor = color.name.trim().toLowerCase();
        //Find Variant, for checking duplicate entries
        const variantExists = await existingVariantInternal({ productId, colorName: normalizedColor });
        if (variantExists) {
            throw new Error("Variant with this color already exists");
        }

        //Generate Slug
        const productName = await getProductNameInternal({productId});
        const slug = await generateSlug({productName, colorName: normalizedColor});

        //addNewVariant Internal
        const newVariant = await addNewVariantInternal({ productId, color, images, sizes, discountPrice, slug });
        return newVariant;

    } catch (error) {
        console.log("addNewVariantService Error : ", error);
        throw error;
    }
}