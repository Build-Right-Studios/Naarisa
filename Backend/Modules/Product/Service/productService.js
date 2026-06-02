import { createProductInternal } from "../Internal/createProduct.js";
import { findProductInternal } from "../Internal/findProduct.js";

export const addProductService = async (productData) => {
  try {
    const existingProduct = await findProductInternal(productData.name);
    if (existingProduct) {
      throw new Error("Product already exists");
    }
    const product = await createProductInternal(productData);
    return product;
  } catch (error) {
    console.error("productService error:", error);
    throw error;
  }
};