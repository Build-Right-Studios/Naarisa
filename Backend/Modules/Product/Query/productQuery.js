import { Product } from "../../../MongoDB/models.js";

export const createProductQuery = async (data) => {
  try {
    const product = await Product.create(data);
    return product;
  } catch (error) {
    console.error("productQuery error:", error);
    throw error;
  }
};