import { Variant } from "../../../MongoDB/models.js";

export const searchProducts = async (req, res) => {
  try {
    const { q = "", limit = 8 } = req.query;
    const query = q.trim();

    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    // split "red kurta" -> ["red", "kurta"], each must match SOMEWHERE
    const tokens = query.split(/\s+/).filter(Boolean).map((t) => new RegExp(t, "i"));

    const andConditions = tokens.map((token) => ({
      $or: [
        { "product.name": token },
        { "product.category": token },
        { "product.tags": token },
        { "color.name": token },
      ],
    }));

    const variants = await Variant.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "products", // must match actual Mongo collection name (usually lowercase plural)
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { $and: andConditions } },
      { $sort: { createdAt: -1 } },
      { $limit: Number(limit) },
      {
        $project: {
          slug: 1,
          discountPrice: 1,
          "color.name": 1,
          images: { $slice: ["$images", 1] }, // only need first image
          "product.name": 1,
          "product.category": 1,
          "product.basePrice": 1,
        },
      },
    ]);

    const formatted = variants.map((v) => ({
      id: v._id.toString(),
      name: `${v.product.name} - ${v.color.name.charAt(0).toUpperCase() + v.color.name.slice(1)}`,
      category: v.product.category,
      slug: v.slug,
      price: v.discountPrice ?? v.product.basePrice,
      image: v.images?.[0]?.url || null,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Search failed.",
      error: error.message,
    });
  }
};