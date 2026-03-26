import { findProductQuery } from "../Query/productQuery.js";

export const findProductInternal = async (name) => {
  try {
    const product = await findProductQuery(name);
    return product;
  } catch (error) {
    console.error("findProductInternal error:", error);
    throw error;
  }
};