import { Variant } from "../../../MongoDB/models.js";

export const getBestSellers = async (req, res) => {
  try {
    const variants = await Variant.find({
      isBestSeller: true,
      isActive: true,
    })
      .populate("productId")
      .limit(8);

    console.log("Variants : ", variants)

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