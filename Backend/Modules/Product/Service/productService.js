import { createProductInternal } from "../Internal/productInternal.js";

export const addProductService = async (productData) => {
  try {
    const product = await createProductInternal(productData);
    return product;
  } catch (error) {
    console.error("productService error:", error);
    throw error;
  }
};