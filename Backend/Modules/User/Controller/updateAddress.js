import { updateAddressService } from "../Service/updateAddressService.js";

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addresses = await updateAddressService(req.user._id, id, req.body);
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: addresses
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("updateAddress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};