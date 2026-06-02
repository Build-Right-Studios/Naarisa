import { Review } from "../../../MongoDB/models.js";

export const getReviews = async (req, res) => {
  try {
    const { variantId } = req.params;

    const reviews = await Review.find({ variantId })
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
          ) / 10
        : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Error in getReviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};