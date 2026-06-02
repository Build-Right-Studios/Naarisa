import { User } from "../../../MongoDB/models.js";

export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          wishlist: id
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {
    console.error("removeFromWishlist:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};