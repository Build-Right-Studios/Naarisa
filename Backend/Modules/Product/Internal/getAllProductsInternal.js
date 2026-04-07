import { getAllProductsQuery } from "../Query/getAllProductsQuery.js";

export const getAllProductsInternal = async (data) => {
  return await getAllProductsQuery(data);
};