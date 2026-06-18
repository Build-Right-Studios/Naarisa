import { Variant } from "../../../MongoDB/models.js";

/**
 * Uses aggregation so we can:
 *  1. JOIN Product (for category + basePrice)
 *  2. Filter by category in the DB (fixes the pagination bug in the original)
 *  3. Filter by discount % (computed as (basePrice - discountPrice) / basePrice * 100)
 */
export const getAllProductsQuery = async (data) => {
  try {
    const { filter, skip, limit, sortOption, category, discountPercent } = data;

    // Convert the simple filter object into $match stages
    const initialMatch = { ...filter };

    // Build aggregation pipeline
    const pipeline = [
      // Stage 1: match variant-level filters (availability, price range, colour, isActive)
      { $match: initialMatch },

      // Stage 2: join Product to get name, category, basePrice
      {
        $lookup: {
          from:         "products",
          localField:   "productId",
          foreignField: "_id",
          as:           "productId",
        },
      },

      // Stage 3: unwind (lookup returns array)
      { $unwind: "$productId" },

      // Stage 4: filter by category if provided (now runs after join)
      ...(category
        ? [{ $match: { "productId.category": category } }]
        : []),

      // Stage 5: compute discountPercent and filter if required
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

      // Stage 6: sort
      { $sort: sortOption },

      // Stage 7: facet — run count and paginated data in one round-trip
      {
        $facet: {
          total:    [{ $count: "count" }],
          variants: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id:          1,
                slug:         1,
                color:        1,
                images:       1,
                discountPrice: 1,
                createdAt:    1,
                "productId._id":      1,
                "productId.name":     1,
                "productId.category": 1,
                "productId.basePrice": 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await Variant.aggregate(pipeline);

    const total    = result.total[0]?.count || 0;
    const variants = result.variants || [];

    return { variants, total };
  } catch (error) {
    console.log("getAllProductsQuery Error:", error);
    throw error;
  }
};