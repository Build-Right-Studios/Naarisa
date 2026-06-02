import { Variant } from "../../../MongoDB/models.js";

export const getNewArrivals = async (req, res) => {
  try {
    const variants = await Variant.find({
      isNewArrival: true,
      isActive: true,
    })
      .populate("productId")
      .limit(8);

    return res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};