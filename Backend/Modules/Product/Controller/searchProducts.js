import { Variant } from "../../../MongoDB/models.js";

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

    const variants = await Variant.find({ isActive: true })
      .populate({
        path: "productId",
        match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
          ],
        },
        select: "name category basePrice",
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Remove variants whose parent product didn't match
    const matchedVariants = variants.filter(
      (variant) => variant.productId
    );

    const formatted = matchedVariants.map((variant) => ({
      id: variant._id.toString(),

      name: `${variant.productId.name} - ${
        variant.color.name.charAt(0).toUpperCase() +
        variant.color.name.slice(1)
      }`,

      category: variant.productId.category,

      slug: variant.slug,

      price:
        variant.discountPrice ||
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