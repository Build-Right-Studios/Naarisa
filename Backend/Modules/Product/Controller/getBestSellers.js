import { Variant } from "../../../MongoDB/models.js";
import { cloudinaryTransform } from "../../../Utils/cloudinaryTransform.js";

/**
 * GET /api/product/best-sellers
 *
 * Query params (all optional):
 *   availability — "In Stock" | "Out of Stock" | both comma-separated
 *   priceRange   — comma-separated ranges e.g. "0-1000,2000-3500"
 *   discount     — minimum discount % e.g. 20
 *   colours      — comma-separated colour names e.g. "Red,Ivory"
 *   sort         — "newest" | "price_asc" | "price_desc" | "alphabetical"
 */

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { discountPriceNumeric: 1 },
  price_desc: { discountPriceNumeric: -1 },
  alphabetical: { "productId.name": 1 },
};

const PRICE_SORTS = new Set(["price_asc", "price_desc"]);

export const getBestSellers = async (req, res) => {
  try {
    const { availability, priceRange, discount, colours, sort } = req.query;

    /* ── Base filter ─────────────────────────────────────────────────────── */
    const filter = { isBestSeller: true, isActive: true };

    // Availability
    if (availability) {
      const av = availability.split(",").map((s) => s.trim());
      const wantIn = av.includes("In Stock");
      const wantOut = av.includes("Out of Stock");
      if (wantIn && !wantOut) filter.sizes = { $elemMatch: { quantity: { $gt: 0 } } };
      if (wantOut && !wantIn) filter.sizes = { $not: { $elemMatch: { quantity: { $gt: 0 } } } };
    }

    // Price range
    // if (priceRange) {
    //   const ranges = priceRange.split(",").map((r) => {
    //     const [min, max] = r.split("-").map(Number);
    //     return { discountPrice: { $gte: min, $lte: max } };
    //   });
    //   filter.$or = ranges;
    // }

    // Colour
    if (colours) {
      filter["color.name"] = {
        $in: colours.split(",").map((c) => c.trim().toLowerCase()),
      };
    }

    /* ── Resolve sort ────────────────────────────────────────────────────── */
    const resolvedSort = SORT_MAP[sort] ?? SORT_MAP.newest;
    const needsNumericPrice = PRICE_SORTS.has(sort);

    /* ── Aggregation pipeline ────────────────────────────────────────────── */
    const discountPercent = discount ? Number(discount) : null;

    const pipeline = [
      { $match: filter },

      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId",
        },
      },
      { $unwind: "$productId" },

      {
        $addFields: {
          effectivePrice: {
            $ifNull: ["$discountPrice", "$productId.basePrice"],
          },
        },
      },

      ...(priceRange
        ? [
          {
            $match: {
              $or: priceRange.split(",").map((range) => {
                const [min, max] = range.split("-").map(Number);

                return {
                  effectivePrice: {
                    $gte: min,
                    $lte: max,
                  },
                };
              }),
            },
          },
        ]
        : []),

      // ── Price sort prep ────────────────────────────────────────────────
      // Use discountPrice when available, fall back to productId.basePrice.
      // This means every product gets a valid price for sorting — no nulls.
      ...(needsNumericPrice
        ? [
          {
            $addFields: {
              discountPriceNumeric: {
                $toDouble: {
                  $ifNull: ["$discountPrice", "$productId.basePrice"],
                },
              },
            },
          },
        ]
        : []),

      // ── Discount % filter ──────────────────────────────────────────────
      ...(discountPercent
        ? [
          {
            $addFields: {
              computedDiscount: {
                $cond: {
                  if: {
                    $and: [
                      { $gt: ["$productId.basePrice", 0] },
                      { $lt: ["$discountPrice", "$productId.basePrice"] },
                    ],
                  },
                  then: {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$productId.basePrice", "$discountPrice"] },
                          "$productId.basePrice",
                        ],
                      },
                      100,
                    ],
                  },
                  else: 0,
                },
              },
            },
          },
          { $match: { computedDiscount: { $gte: discountPercent } } },
        ]
        : []),

      { $sort: resolvedSort },
      { $limit: 50 },
    ];

    const variants = await Variant.aggregate(pipeline);

    const optimized = variants.map((variant) => ({
      ...variant,
      images: variant.images.map((image) => ({
        ...image,
        url: cloudinaryTransform(image.url, "f_auto,q_auto,w_500,h_750,c_fill"),
      })),
    }));

    return res.status(200).json({
      success: true,
      data: optimized,
    });
  } catch (error) {
    console.error("getBestSellers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};