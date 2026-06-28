import { createShipmentService } from "../Service/createShipmentService.js";

export const createShipment = async (req, res) => {
  try {

    const { orderId } = req.params;

    const shipment = await createShipmentService(orderId);

    return res.status(200).json({
      success: true,
      shipment
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};