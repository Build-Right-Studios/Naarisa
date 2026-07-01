import { assignCourierService } from "../Service/assignCourierService.js";

export const assignCourier = async (req, res) => {
  try {
    // ✅ Validate inputs
    if (!req.body.courierId) {
      return res.status(400).json({
        success: false,
        message: "courierId is required in request body",
      });
    }

    const data = await assignCourierService(
      req.params.orderId,
      req.body.courierId
    );

    // ✅ Return with success status
    return res.status(200).json(data);
  } catch (err) {
    console.error("assignCourier Error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to assign courier",
    });
  }
};