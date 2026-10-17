import { findHiddenCategoryNamesQuery } from "../Query/categoryQuery.js";

// Aggregation stage that drops variants whose product is in a hidden category, so hiding a
// category (e.g. a launch that isn't ready yet) also takes its products off the storefront
// listings and search. `productField` is where the joined Product sits ("productId" or "product").
export const excludeHiddenCategoriesStages = async (productField) => {
  const hidden = await findHiddenCategoryNamesQuery();
  return hidden.length ? [{ $match: { [`${productField}.category`]: { $nin: hidden } } }] : [];
};
