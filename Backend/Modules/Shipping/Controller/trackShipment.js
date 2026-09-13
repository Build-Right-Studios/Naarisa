import { trackShipmentService } from "../Service/trackShipmentService.js";

export const trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;
    console.log("User Id  :", userId)

    const tracking = await trackShipmentService(orderId, userId);

    return res.status(200).json({
      success: true,
      tracking
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch tracking status."
    });
  }
};