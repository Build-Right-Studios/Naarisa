import mongoose from "mongoose";
import { User } from "../../../MongoDB/models.js";

export const addToWishlist = async (req, res) => {
  try {
    const { variantId } = req.body;

    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: "Variant ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Variant ID"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const alreadyExists = user.wishlist.some(
      (id) => id.toString() === variantId
    );

    if (alreadyExists) {
      return res.status(200).json({
        success: true,
        message: "Already in wishlist"
      });
    }

    user.wishlist.push(variantId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {
    console.error("addToWishlist:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};