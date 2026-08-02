import { Review, Variant, Order } from "../../../MongoDB/models.js";
import { uploadImagesToImageKit } from "../../../config/imagekit.js"; // adjust path

export const addReview = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { name, rating, text } = req.body;
    const userId = req.user._id;

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

    const hasPurchased = await Order.exists({
      user: userId,
      status: "delivered",
      "items.variant": variantId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you've purchased and received.",
      });
    }

    const alreadyReviewed = await Review.findOne({ variantId, userId });
    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "You've already reviewed this product.",
      });
    }

    // Upload review images, if any
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadImagesToImageKit(req.files, "/naarisa/reviews");
    }

    const review = await Review.create({
      variantId,
      productId: variant.productId,
      userId,
      name: name.trim(),
      rating: Number(rating),
      text: text.trim(),
      images,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You've already reviewed this product.",
      });
    }
    console.error("Error in addReview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};