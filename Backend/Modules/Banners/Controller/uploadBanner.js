import { uploadBannerService } from "../Service/uploadBannerService.js";
import { uploadImagesToImageKit } from "../../../config/imagekit.js";

export const uploadBanner = async (req, res) => {
  try {
    const { title, link, order } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const desktopFile = req.files?.desktopImage?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    if (!desktopFile || !mobileFile) {
      throw { status: 400, message: "Both desktop and mobile images are required" };
    }

    // Upload both to ImageKit, in their respective folders
    const [desktopUpload] = await uploadImagesToImageKit([desktopFile], "/naarisa/banners/desktop");
    const [mobileUpload] = await uploadImagesToImageKit([mobileFile], "/naarisa/banners/mobile");

    const cleanLink = link ? link.replace(/^"|"$/g, '') : null;

    const banner = await uploadBannerService({
      title,
      desktopImage: desktopUpload.url,
      desktopImageFileId: desktopUpload.fileId,
      mobileImage: mobileUpload.url,
      mobileImageFileId: mobileUpload.fileId,
      cleanLink,
      order: Number(order)
    });

    return res.status(201).json({
      success: true,
      message: "Banner uploaded successfully",
      data: banner
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("uploadBanner error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};