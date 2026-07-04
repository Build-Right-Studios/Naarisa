import { Variant } from "../../../MongoDB/models.js";
import { Product } from "../../../MongoDB/models.js";

export const getVariantBySlugQuery = async (data) => {
  const { slug } = data;
  const variant = await Variant.findOne({ slug, isActive: true });
  return variant;
};

export const getProductByIdQuery = async ({ id }) => {
  return await Product.findById(id).select(
    "name basePrice"
  );
};

export const getVariantsByProductQuery = async ({ id }) => {
  const variant = await Variant.find({
    productId: id,
    isActive: true
  }).select(
    "color slug description stylingTips fabricCare returnExchange images sizes discountPrice"
  );
  return variant;
};