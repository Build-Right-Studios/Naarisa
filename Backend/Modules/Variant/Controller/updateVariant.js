import { updateVariantService } from "../Service/updateVariantService.js";
import { Variant } from "../../../MongoDB/models.js";
import { uploadImagesToImageKit, deleteImagesFromImageKit } from "../../../config/imagekit.js";

export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const existingVariant = await Variant.findById(id);

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // Existing images kept by frontend
    let existingImages = [];
    try {
      existingImages = JSON.parse(req.body.existingImages || "[]");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid existingImages format",
      });
    }

    // Delete removed images from ImageKit (compare by fileId now, not public_id)
    const removedImages = existingVariant.images.filter(
      (oldImg) => !existingImages.some((img) => img.fileId === oldImg.fileId)
    );

    if (removedImages.length > 0) {
      await deleteImagesFromImageKit(removedImages);
    }

    // Upload newly added images to ImageKit
    let newImages = [];
    if (req.files && req.files.length > 0) {
      try {
        newImages = await uploadImagesToImageKit(req.files, "/naarisa/variants");
      } catch (err) {
        if (err.failedUploads) {
          console.error("Upload batch had failures:", JSON.stringify(err.failedUploads, null, 2));
          return res.status(422).json({
            success: false,
            message: `${err.failedUploads.length} image(s) failed to upload. Please check file format/size and retry.`,
            failedFiles: err.failedUploads.map(f => ({ name: f.originalname, reason: f.error })),
          });
        }
        throw err; // unexpected error, let it bubble to your generic catch block
      }
    }

    // Build updates object
    const updates = {
      ...req.body,
      images: [...existingImages, ...newImages],
    };

    delete updates.existingImages;

    if (updates.sizes) {
      updates.sizes = JSON.parse(updates.sizes);
    }

    if (updates.color) {
      updates.color = JSON.parse(updates.color);
    }

    const updatedVariant = await updateVariantService({ id, updates });

    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: updatedVariant,
    });
  } catch (error) {
    console.error("updateVariant Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};