import { Variant } from "../../../MongoDB/models.js";
import { Product } from "../../../MongoDB/models.js";

export const getVariantBySlugQuery = async (data) => {
  const { slug } = data;
  const variant = await Variant.findOne({ slug, isActive: true });
  return variant;
};

export const getProductByIdQuery = async (data) => {
  const { id } = data;
  const product = await Product.findById(id).select(
    "name description stylingTips fabricCare basePrice"
  );
  return product;
};

export const getVariantsByProductQuery = async (data) => {
  const { id } = data;
  const variants = await Variant.find({ productId: id, isActive: true }).select(
    "color slug"
  );
  return variants;
};