import { getAllProductsInternal } from "../Internal/getAllProductsInternal.js";
// import { cloudinaryTransform } from "../../../Utils/cloudinaryTransform.js";
import { imagekitTransform } from "../../../Utils/cloudinaryTransform.js";

export const getAllProductsService = async (data) => {
  try {
    const {
      category,
      sort,
      page,
      limit,
      // filter params from FilterPanel
      availability,  // "In Stock,Out of Stock"
      priceRange,    // "0-1000,1000-2000"
      discount,      // "20"  (minimum discount %)
      colours,       // "Red,Blue"
      sizes,
    } = data;

    const skip = (page - 1) * limit;

    /* ── Build Variant-level filter ── */
    const filter = { isActive: true };

    // Category — pushed into DB query (fixes the pagination bug)
    // We join on productId, so category filtering is done via $lookup + $match
    // handled in the query layer via the aggregation pipeline

    // Availability — derived from sizes array
    /* ── Availability + Size ── */

    const sizeElemMatch = {};

    if (availability) {
      const av = availability.split(",").map((s) => s.trim());

      const wantInStock = av.includes("In Stock");
      const wantOutStock = av.includes("Out of Stock");

      if (wantInStock && !wantOutStock) {
        sizeElemMatch.quantity = { $gt: 0 };
      }

      if (wantOutStock && !wantInStock) {
        if (sizes) {
          filter.sizes = {
            $elemMatch: {
              size: {
                $in: sizes
                  .split(",")
                  .map((s) => s.trim().toUpperCase()),
              },
              quantity: 0,
            },
          };
        } else {
          filter.sizes = {
            $not: {
              $elemMatch: {
                quantity: { $gt: 0 },
              },
            },
          };
        }
      }
    }

    // Size
    if (sizes) {
      sizeElemMatch.size = {
        $in: sizes
          .split(",")
          .map((s) => s.trim().toUpperCase()),
      };
    }

    // Apply combined filter
    if (Object.keys(sizeElemMatch).length && !filter.sizes) {
      filter.sizes = {
        $elemMatch: sizeElemMatch,
      };
    }

    // Price range — supports multiple ranges (OR logic)
    // if (priceRange) {
    //   const ranges = priceRange.split(",").map((r) => {
    //     const [min, max] = r.split("-").map(Number);
    //     return { discountPrice: { $gte: min, $lte: max } };
    //   });
    //   filter.$or = ranges;
    // }

    // Colour — case-insensitive match against color.name
    if (colours) {
      const colourList = colours.split(",").map((c) => c.trim().toLowerCase());
      filter["color.name"] = { $in: colourList };
    }

    /* ── Sort option ── */
    const SORT_MAP = {
      newest: { createdAt: -1 },
      price_asc: { discountPriceNumeric: 1 },
      price_desc: { discountPriceNumeric: -1 },
      alphabetical: { "productId.name": 1 },
    };

    const sortOption = SORT_MAP[sort] ?? SORT_MAP.newest;

    /* ── Fetch from DB ──
         category and discount% require a join with Product, so we pass
         them separately and handle them in the query via aggregation.     */
    const { variants, total } = await getAllProductsInternal({
      filter,
      skip,
      limit,
      sort,
      sortOption,
      category: category || null,
      discountPercent: discount ? Number(discount) : null,
      priceRange,
    });

    /* ── Shape response ── */
    const products = variants.map((variant) => ({
      ...variant,

      images: variant.images?.map((image) => ({
        ...image,
        // url: cloudinaryTransform(
        //   image.url,
        //   "f_auto,q_auto,w_500,h_750,c_fill"
        // ),
        url: imagekitTransform(
          image.url,
          "f-auto,q-auto,w-500,h-750,c-maintain_ratio"
        ),
      })),

      productId: {
        ...variant.productId,
      },
    }));

    return {
      products,
      pagination: {
        total,
        page,
        limit,
      },
    };
  } catch (error) {
    console.log("getAllProductsService Error:", error);
    throw error;
  }
};