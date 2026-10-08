import { createShipmentService } from "../Service/createShipmentService.js";

export const createShipment = async (req, res) => {
  try {

    const { orderId } = req.params;
    const { length, breadth, height, weight } = req.body;

    const shipment = await createShipmentService(orderId, length, breadth, height, weight);

    return res.status(200).json({
      success: true,
      shipment
    });

  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create shipment."
    });
  }
};