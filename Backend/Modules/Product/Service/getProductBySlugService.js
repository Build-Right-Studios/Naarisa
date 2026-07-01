import { getVariantBySlugInternal, getProductByIdInternal, getVariantsByProductInternal } from "../Internal/getProductBySlugInternal.js";
import { cloudinaryTransform } from "../../../Utils/cloudinaryTransform.js";

export const getProductBySlugService = async ({ slug }) => {
  try {
    const currentVariant = await getVariantBySlugInternal({ slug });

    if (!currentVariant) {
      throw new Error("Product not found");
    }

    const [product, variants] = await Promise.all([
      getProductByIdInternal({ id: currentVariant.productId }),
      getVariantsByProductInternal({ id: currentVariant.productId })
    ]);

    return {
      product,
      currentVariant: {
        ...currentVariant,

        // ✅ SIMPLIFIED: Let frontend build srcSet, only send main URL
        images: currentVariant.images.map((img) => ({
          ...img,
          // Send single optimized URL - frontend handles responsive
          url: cloudinaryTransform(img.url, "f_auto,q_auto,w_1000,c_limit"),
          // Frontend will construct srcSet from this URL pattern
          priority: false,
        })),

        description: currentVariant.description,
        stylingTips: currentVariant.stylingTips,
        fabricCare: currentVariant.fabricCare,
        returnExchange: currentVariant.returnExchange,

        price: currentVariant.discountPrice ?? product.basePrice
      },

      allVariants: variants.map(v => ({
        color: v.color,
        slug: v.slug
      }))
    };
  } catch (error) {
    console.log("Error in getProductBySlugService:", error);
    throw error;
  }
};