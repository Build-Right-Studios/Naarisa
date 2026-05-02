import { adminGetUsersService } from "../Service/adminGetUsersService.js";

export const adminGetUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const data = await adminGetUsersService({
      page: Number(page),
      limit: Number(limit)
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      ...data
    });

  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("adminGetUsers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};