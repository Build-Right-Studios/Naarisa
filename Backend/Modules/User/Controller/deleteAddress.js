import { deleteAddressService } from "../Service/deleteAddressService.js";

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addresses = await deleteAddressService(req.user._id, id);
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: addresses
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("deleteAddress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};