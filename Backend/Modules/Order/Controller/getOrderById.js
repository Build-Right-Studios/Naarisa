import { getOrderByIdService } from "../Service/getOrderByIdService.js";

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getOrderByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getOrderById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};