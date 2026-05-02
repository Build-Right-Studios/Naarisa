import { getAddressesService } from "../Service/getAddressesService.js";

export const getAddresses = async (req, res) => {
  try {
    const addresses = await getAddressesService(req.user._id);
    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("getAddresses error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};