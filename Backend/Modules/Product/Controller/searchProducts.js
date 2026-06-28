import { Product, Variant } from "../../../MongoDB/models.js";

export const searchProducts = async (req, res) => {
  try {
    const { q = "", limit = 8 } = req.query;

    const query = q.trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const regex = new RegExp(query, "i");

    // Find matching products
    const matchedProducts = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { tags: regex },
      ],
    })
      .select("_id")
      .lean();

    const productIds = matchedProducts.map((product) => product._id);

    // Find matching variants by product OR color
    const variants = await Variant.find({
      isActive: true,
      $or: [
        {
          productId: { $in: productIds },
        },
        {
          "color.name": regex,
        },
      ],
    })
      .populate({
        path: "productId",
        select: "name category basePrice",
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const formatted = variants.map((variant) => ({
      id: variant._id.toString(),

      name: `${variant.productId.name} - ${
        variant.color.name.charAt(0).toUpperCase() +
        variant.color.name.slice(1)
      }`,

      category: variant.productId.category,

      slug: variant.slug,

      price:
        variant.discountPrice ??
        variant.productId.basePrice,

      image: variant.images?.[0]?.url || null,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Search failed.",
      error: error.message,
    });
  }
};