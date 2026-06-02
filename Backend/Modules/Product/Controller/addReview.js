import { Review, Variant } from "../../../MongoDB/models.js";

export const addReview = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { name, rating, text } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: "Name, rating, and review text are required.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const variant = await Variant.findById(variantId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found.",
      });
    }

    const review = await Review.create({
      variantId,
      productId: variant.productId,
      name: name.trim(),
      rating: Number(rating),
      text: text.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: review,
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};