import { getVariantBySlugInternal, getProductByIdInternal, getVariantsByProductInternal } from "../Internal/getProductBySlugInternal.js";

export const getProductBySlugService = async ({ slug }) => {
  try {

    const currentVariant = await getVariantBySlugInternal({ slug });

    if (!currentVariant) {
      throw new Error("Product not found");
    }

    const product = await getProductByIdInternal({
      id: currentVariant.productId
    });

    const variants = await getVariantsByProductInternal({
      id: currentVariant.productId
    });

    return {
      product,

      // ✅ Variant is now PRIMARY source of product page content
      currentVariant: {
        ...currentVariant,

        description: currentVariant.description,
        stylingTips: currentVariant.stylingTips,
        fabricCare: currentVariant.fabricCare,
        returnExchange: currentVariant.returnExchange,

        price:
          currentVariant.discountPrice ??
          product.basePrice
      },

      allVariants: variants.map(v => ({
        color: v.color,
        slug: v.slug
      }))
    };

  } catch (error) {
    console.log("Error in getProductBySlugService : ", error);
    throw error;
  }
};