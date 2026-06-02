import { getOrderByIdService } from "../Service/getOrderByIdService.js";

export const getOrderById = async (req, res) => {
  try {
    const order = await getOrderByIdService(
      req.params.id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};