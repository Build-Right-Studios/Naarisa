import { Variant } from "../../../MongoDB/models.js";
import { cloudinaryTransform } from "../../../Utils/cloudinaryTransform.js";

/**
 * Service + query combined for category products.
 * Called by getCategoryProducts controller.
 *
 * Supports:
 *   category     — required, matched against productId.category
 *   sort         — newest | price_asc | price_desc | discount
 *   page / limit — pagination
 *   availability — "In Stock" | "Out of Stock"
 *   priceRange   — "0-1000,1000-2000"
 *   discount     — minimum discount %
 *   colours      — "Red,Blue"
 */
export const getCategoryProductsService = async ({
  category,
  sort,
  page,
  limit,
  availability,
  priceRange,
  discount,
  colours,
}) => {
  const skip = (page - 1) * limit;

  /* ── Variant-level filter ── */
  const filter = { isActive: true };

  if (availability) {
    const av = availability.split(",").map((s) => s.trim());
    const wantIn = av.includes("In Stock");
    const wantOut = av.includes("Out of Stock");
    if (wantIn && !wantOut) filter.sizes = { $elemMatch: { quantity: { $gt: 0 } } };
    if (wantOut && !wantIn) filter.sizes = { $not: { $elemMatch: { quantity: { $gt: 0 } } } };
  }

  if (colours) {
    filter["color.name"] = {
      $in: colours.split(",").map(
        (c) => new RegExp(`^${c.trim()}$`, "i")
      ),
    };
  }

  /* ── Sort ── */
  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    price_asc: {
      sellingPrice: 1,
      createdAt: -1,
    },

    price_desc: {
      sellingPrice: -1,
      createdAt: -1,
    },

    alphabetical: {
      displayName: 1,
      createdAt: -1,
    },
  };

  const sortOption = sortOptions[sort] || sortOptions.newest;

  const discountPercent = discount ? Number(discount) : null;

  /* ── Aggregation pipeline ── */
  const pipeline = [
    { $match: filter },

    // Join Product
    { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "productId" } },
    
    { $unwind: "$productId" },

    {
      $addFields: {
        sellingPrice: {
          $ifNull: [
            "$discountPrice",
            "$productId.basePrice"
          ]
        },

        displayName: {
          $concat: [
            "$productId.name",
            " - ",
            "$color.name"
          ]
        }
      }
    },

    ...(priceRange
      ? [
        {
          $match: {
            $or: priceRange.split(",").map((range) => {
              const [min, max] = range.split("-").map(Number);

              return {
                sellingPrice: {
                  $gte: min,
                  $lte: max,
                },
              };
            }),
          },
        },
      ]
      : []),

    // Filter by category (after join)
    { $match: { "productId.category": category } },

    // Compute and filter by discount %
    ...(discountPercent
      ? [
        {
          $addFields: {
            computedDiscount: {
              $cond: {
                if: {
                  $and: [
                    { $gt: ["$productId.basePrice", 0] },
                    { $lt: ["$sellingPrice", "$productId.basePrice"] },
                  ],
                },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            "$productId.basePrice",
                            "$sellingPrice",
                          ],
                        },
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

    { $sort: sortOption },

    // Count + paginate in one round-trip
    {
      $facet: {
        total: [{ $count: "count" }],
        variants: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1, slug: 1, color: 1, images: 1,
              discountPrice: 1, sizes: 1, createdAt: 1, sellingPrice: 1,
              isBestSeller: 1, isNewArrival: 1,
              "productId._id": 1, "productId.name": 1,
              "productId.category": 1, "productId.basePrice": 1,
            },
          },
        ],
      },
    },
  ];

  const [result] = await Variant.aggregate(pipeline);
  const total = result.total[0]?.count || 0;

  const optimizedVariants = (result.variants || []).map((variant) => ({
    ...variant,
    images: (variant.images || []).map((image) => ({
      ...image,
      url: cloudinaryTransform(
        image.url,
        "f_auto,q_auto,w_500,h_750,c_fill"
      ),
    })),
  }));

  // Shape to match what CategoryPage's ProductCard expects
  const products = (optimizedVariants || []).map((v) => {
    const basePrice = v.productId.basePrice;
    const sellingPrice = v.sellingPrice;

    // Only include discountPrice if it's actually different from basePrice
    const productData = {
      _id: v._id,
      slug: v.slug,
      name: v.productId.name,
      image: v.images?.[0]?.url || null,
      images: v.images || [],
      price: basePrice,
      color: v.color,
      sizes: v.sizes,
      category: v.productId.category,
      isBestSeller: v.isBestSeller,
      isNewArrival: v.isNewArrival,
    };

    // Only add discountPrice if there's an actual discount
    if (sellingPrice < basePrice) {
      productData.discountPrice = sellingPrice;
    }

    return productData;
  });

  return { products, total };
};