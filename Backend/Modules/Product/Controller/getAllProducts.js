import { getAllProductsService } from "../Service/getAllProductsService.js";

/**
 * GET /api/product/products
 *
 * Query params (all optional):
 *   category     — e.g. "Dresses"
 *   sort         — newest | price_asc | price_desc | name_asc  (default: newest)
 *   page         — 1-based                                      (default: 1)
 *   limit        — items per page                               (default: 12)
 *   availability — "In Stock" | "Out of Stock" | both comma-separated
 *   priceRange   — comma-separated range strings e.g. "0-1000,1000-2000"
 *   discount     — minimum discount % as number e.g. 20
 *   colours      — comma-separated colour names e.g. "Red,Blue,Ivory"
 */
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