import { deactivateVariantService } from "../Service/deactivateVariantService.js";

export const deactivateVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deactivateVariantService(id);

    return res.status(200).json({
      success: true,
      message: "Variant deactivated",
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};