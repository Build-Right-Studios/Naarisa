import { updateProfileService } from "../Service/updateProfileService.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await updateProfileService(req.user._id, { name, email });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};