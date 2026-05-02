import { getBannersService, getActiveBannersService } from "../Service/getBannersService.js";

export const getBanners = async (req, res) => {
  try {
    const banners = await getBannersService();
    return res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: banners
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getBanners error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveBanners = async (req, res) => {
  try {
    const banners = await getActiveBannersService();
    return res.status(200).json({
      success: true,
      message: "Active banners fetched successfully",
      data: banners
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getActiveBanners error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};