import { getAllProductsInternal } from "../Internal/getAllProductsInternal.js";
import { cloudinaryTransform } from "../../../Utils/cloudinaryTransform.js";

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
    } = data;

    const skip = (page - 1) * limit;

    /* ── Build Variant-level filter ── */
    const filter = { isActive: true };

    // Category — pushed into DB query (fixes the pagination bug)
    // We join on productId, so category filtering is done via $lookup + $match
    // handled in the query layer via the aggregation pipeline

    // Availability — derived from sizes array
    if (availability) {
      const av = availability.split(",").map((s) => s.trim());
      const wantInStock = av.includes("In Stock");
      const wantOutStock = av.includes("Out of Stock");

      if (wantInStock && !wantOutStock) {
        // At least one size has quantity > 0
        filter["sizes"] = { $elemMatch: { quantity: { $gt: 0 } } };
      } else if (wantOutStock && !wantInStock) {
        // All sizes have quantity === 0
        filter["sizes"] = { $not: { $elemMatch: { quantity: { $gt: 0 } } } };
      }
      // Both selected = no restriction
    }

    // Price range — supports multiple ranges (OR logic)
    if (priceRange) {
      const ranges = priceRange.split(",").map((r) => {
        const [min, max] = r.split("-").map(Number);
        return { discountPrice: { $gte: min, $lte: max } };
      });
      filter.$or = ranges;
    }

    // Colour — case-insensitive match against color.name
    if (colours) {
      const colourList = colours.split(",").map((c) => c.trim().toLowerCase());
      filter["color.name"] = { $in: colourList };
    }

    /* ── Sort option ── */
    let sortOption = {};
    switch (sort) {
      case "price_asc": sortOption.discountPrice = 1; break;
      case "price_desc": sortOption.discountPrice = -1; break;
      case "name_asc": sortOption.slug = 1; break;
      default: sortOption.createdAt = -1; break; // newest
    }

    /* ── Fetch from DB ──
         category and discount% require a join with Product, so we pass
         them separately and handle them in the query via aggregation.     */
    const { variants, total } = await getAllProductsInternal({
      filter,
      skip,
      limit,
      sortOption,
      category: category || null,
      discountPercent: discount ? Number(discount) : null,
    });

    /* ── Shape response ── */
    const products = variants.map((v) => ({
      id: v._id,
      name: v.productId.name,
      category: v.productId.category,
      slug: v.slug,
      color: v.color,
      image: cloudinaryTransform(
        v.images?.[0]?.url,
        "f_auto,q_auto,w_500,h_750,c_fill"
      ),

      price: v.discountPrice ?? v.productId.basePrice,
    }));

    return {
      products,
      pagination: { total, page, limit },
    };
  } catch (error) {
    console.log("getAllProductsService Error:", error);
    throw error;
  }
};