import { Product, Variant, Order } from "../../../MongoDB/models.js";
import mongoose from "mongoose";

export const getProducts = async (req, res) => {
  try {
    const variants = await Variant.find()
      .populate({
        path: "productId",
        select: "name category basePrice",
      })
      .lean();

    // Aggregate sold quantity per variant+size from Orders
    // Excludes cancelled orders — counts everything else as "sold"
    const soldAggregation = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { variant: "$items.variant", size: "$items.size" },
          totalSold: { $sum: "$items.quantity" },
        },
      },
    ]);

    // Build a fast lookup: "variantId-size" -> soldCount
    const soldMap = {};
    soldAggregation.forEach((entry) => {
      const key = `${entry._id.variant}-${entry._id.size}`;
      soldMap[key] = entry.totalSold;
    });

    const formattedProducts = variants.map((variant) => {
      const sizesWithStock = (variant.sizes || []).map((s) => {
        const key = `${variant._id}-${s.size}`;
        return {
          size: s.size,
          quantity: s.quantity ?? 0, // current stock left
          sold: soldMap[key] || 0,   // total units sold, ever
        };
      });

      return {
        id: variant._id.toString(),
        name: variant.productId?.name || "Unnamed Product",
        category: variant.productId?.category || "Uncategorized",
        slug: variant.slug,
        color: {
          name: variant.color?.name || "",
          hex: variant.color?.hex || "",
        },
        image: variant.images?.[0]?.url || null,
        price: variant.discountPrice || variant.productId?.basePrice || 0,
        isActive: variant.isActive,
        isBestSeller: variant.isBestSeller,
        isNewArrival: variant.isNewArrival,
        sizes: sizesWithStock,
      };
    });

    res.status(200).json({
      success: true,
      message: "All products.",
      data: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products.",
      error: error.message,
    });
  }
};