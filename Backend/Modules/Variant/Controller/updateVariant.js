import { updateVariantService } from "../Service/updateVariantService.js";

export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedVariant = await updateVariantService({id, updates});

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