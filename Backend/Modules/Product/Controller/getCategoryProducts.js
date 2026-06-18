import { getCategoryProductsService } from "../Service/Getcategoryproductsservice.js";

/**
 * GET /api/product/category/:category
 *
 * Query params:
 *   sort         — newest | price_asc | price_desc | discount  (default: newest)
 *   page         — 1-based                                     (default: 1)
 *   limit        — items per page, capped at 48                (default: 12)
 *   availability — "In Stock" | "Out of Stock" | both
 *   priceRange   — comma-separated ranges e.g. "0-1000,2000-3500"
 *   discount     — minimum discount % e.g. 20
 *   colours      — comma-separated colour names e.g. "Red,Ivory"
 */
export const getCategoryProducts = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category?.trim()) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const sort  = req.query.sort || "newest";
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(48, parseInt(req.query.limit) || 12);

    const VALID_SORTS = ["newest", "price_asc", "price_desc", "discount"];
    if (!VALID_SORTS.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort. Must be one of: ${VALID_SORTS.join(", ")}`,
      });
    }

    const { products, total } = await getCategoryProductsService({
      category:     category.trim(),
      sort,
      page,
      limit,
      availability: req.query.availability,
      priceRange:   req.query.priceRange,
      discount:     req.query.discount,
      colours:      req.query.colours,
    });

    return res.status(200).json({
      success: true,
      data:    products,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("getCategoryProducts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};