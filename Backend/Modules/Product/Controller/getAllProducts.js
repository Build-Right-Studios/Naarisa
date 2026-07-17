import { getAllProductsService } from "../Service/getAllProductsService.js";

export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      sort     = "newest",
      page     = 1,
      limit    = 12,
      // filter params
      availability,
      priceRange,
      discount,
      colours,
      sizes,
    } = req.query;

    const data = await getAllProductsService({
      category,
      sort,
      page:  Number(page),
      limit: Number(limit),
      availability,
      priceRange,
      discount,
      colours,
      sizes,
    });

    return res.status(200).json({
      success: true,
      message: "All Products fetched.",
      data,
    });
  } catch (error) {
    console.log("Error in getAllProducts:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: "Failed to get Products.",
    });
  }
};