import { updateVariantService } from "../Service/updateVariantService.js";
import { Variant } from "../../../MongoDB/models.js";
import { cloudinary } from "../../../config/cloudinary.js";

export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const existingVariant = await Variant.findById(id);

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    // Existing images kept by frontend
    let existingImages = [];

    try {
      existingImages = JSON.parse(req.body.existingImages || "[]");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid existingImages format"
      });
    }

    // Newly uploaded images
    const newImages = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename
    })) || [];

    // Delete removed images from Cloudinary
    const removedImages = existingVariant.images.filter(
      (oldImg) =>
        !existingImages.some(
          (img) => img.public_id === oldImg.public_id
        )
    );

    for (const img of removedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.log("Cloudinary delete failed:", err);
      }
    }

    // Build updates object
    const updates = {
      ...req.body,
      images: [...existingImages, ...newImages]
    };

    delete updates.existingImages;

    // Parse sizes
    if (updates.sizes) {
      updates.sizes = JSON.parse(updates.sizes);
    }

    // Parse color
    if (updates.color) {
      updates.color = JSON.parse(updates.color);
    }

    const updatedVariant = await updateVariantService({
      id,
      updates
    });

    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: updatedVariant
    });

  } catch (error) {

    console.error("updateVariant Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};