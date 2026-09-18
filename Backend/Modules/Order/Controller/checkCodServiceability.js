// Delivery/Controller/checkCodServiceability.js
import { checkCodServiceabilityService } from "../Service/checkCodServiceabilityService.js";

export const checkCodServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;
    const result = await checkCodServiceabilityService(pincode);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to check serviceability.",
    });
  }
};