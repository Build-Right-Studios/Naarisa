import { adminGetUserByIdService } from "../Service/adminGetUserByIdService.js";

export const adminGetUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await adminGetUserByIdService(id);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data
    });

  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("adminGetUserById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};