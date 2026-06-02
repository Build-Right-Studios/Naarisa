import { getCategoryProductsService } from "../Service/Getcategoryproductsservice.js";

/**
 * GET /api/product/category/:category
 *
 * Query params:
 *   sort    — newest | price_asc | price_desc | discount   (default: newest)
 *   page    — 1-based page number                          (default: 1)
 *   limit   — items per page                               (default: 12)
 *
 * Response:
 * {
 *   success: true,
 *   data: [ ...products with nested variants ],
 *   total: <number>,      — total matching products (before pagination)
 *   page: <number>,
 *   limit: <number>,
 *   hasMore: <boolean>
 * }
 */
export const getCategoryProducts = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const sort  = req.query.sort  || "newest";
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(48, parseInt(req.query.limit) || 12); // cap at 48

    const VALID_SORTS = ["newest", "price_asc", "price_desc", "discount"];
    if (!VALID_SORTS.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort. Must be one of: ${VALID_SORTS.join(", ")}`,
      });
    }

    const { products, total } = await getCategoryProductsService({
      category: category.trim(),
      sort,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: products,
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