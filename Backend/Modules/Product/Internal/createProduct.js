import { createProductQuery } from "../Query/productQuery.js";

export const createProductInternal = async (data) => {
  try {
    const product = await createProductQuery(data);
    return product;
  } catch (error) {
    console.error("createProductInternal error:", error);
    throw error;
  }
};