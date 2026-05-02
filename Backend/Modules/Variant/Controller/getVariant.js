import { Variant } from "../../../MongoDB/models.js";

export const getVariant = async (req, res) => {
  try {
    console.log(req.params.id);
    const variant = await Variant.findById(req.params.id);

    console.log(variant);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    res.json({
      success: true,
      data: variant
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};