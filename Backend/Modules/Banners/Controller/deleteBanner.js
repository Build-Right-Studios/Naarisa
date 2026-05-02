import { deleteBannerService } from "../Service/deleteBannerService.js";

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteBannerService(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully"
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("deleteBanner error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};