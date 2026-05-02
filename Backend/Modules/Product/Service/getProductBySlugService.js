import { getVariantBySlugInternal, getProductByIdInternal, getVariantsByProductInternal } from "../Internal/getProductBySlugInternal.js";

export const getProductBySlugService = async (productData) => {
    try {
        const { slug } = productData;
        console.log(slug)
        const currentVariant = await getVariantBySlugInternal({ slug });
        console.log(currentVariant)

        if (!currentVariant) {
            throw new Error("Product not found");
        }

        const product = await getProductByIdInternal({ id: currentVariant.productId });

        const variants = await getVariantsByProductInternal({ id: currentVariant.productId });

        return {
            product,
            currentVariant,
            allVariants: variants.map(v => ({
                color: v.color,
                slug: v.slug
            }))
        }
    } catch (error) {
        console.log("Error in getProductBySlugService : ", error);
        throw error;
    }
}