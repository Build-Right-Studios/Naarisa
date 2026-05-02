import { getProfileService } from "../Service/getProfileService.js";

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};