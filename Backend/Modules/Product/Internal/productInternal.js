import { createProductQuery } from "../Query/productQuery.js";

export const createProductInternal = async (data) => {
  try {
    const product = await createProductQuery(data);
    return product;
  } catch (error) {
    console.error("productInternal error:", error);
    throw error;
  }
};