import { updateVariantService } from "../Service/updateVariantService.js";
import { Variant } from "../../../MongoDB/models.js";

export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      const variant = await Variant.findById(id);

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: variant
      });
    }

    const updatedVariant = await updateVariantService({ id, updates });

    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: updatedVariant
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};