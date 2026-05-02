import { Variant } from "../../../MongoDB/models.js";

export const getAllProductsQuery = async (data) => {
  try {
    const { filter, skip, limit, sortOption } = data;
    const [variants, total] = await Promise.all([
      Variant.find(filter)
        .populate("productId", "name category")
        .select("_id slug color images discountPrice createdAt")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),

      Variant.countDocuments(filter)
    ]);

    return { variants, total };

  } catch (error) {
    console.log("getAllProductsQuery Error:", error);
    throw error;
  }
};