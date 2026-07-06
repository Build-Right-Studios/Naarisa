import { markOrderShippedService } from "../Service/markOrderShippedService.js";

export const markOrderShipped = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingUrl, awbCode, courierName } = req.body;

    if (!awbCode || !awbCode.trim()) {
      return res.status(400).json({ success: false, message: "AWB number is required" });
    }

    const order = await markOrderShippedService(id, { trackingUrl, awbCode, courierName });

    return res.status(200).json({
      success: true,
      message: "Order marked as shipped. SMS is being sent.",
      data: order,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("markOrderShipped error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};