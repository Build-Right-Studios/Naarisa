import { User } from "../../../MongoDB/models.js";

export const getWishlist = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate({
        path: "wishlist",
        populate: {
          path: "productId"
        }
      });

    return res.status(200).json({
      success: true,
      data: user.wishlist
    });

  } catch (error) {
    console.error("getWishlist:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};