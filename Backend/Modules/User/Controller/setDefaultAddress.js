import { setDefaultAddressService } from "../Service/setDefaultAddressService.js";

export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addresses = await setDefaultAddressService(req.user._id, id);
    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: addresses
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("setDefaultAddress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};