import { addAddressService } from "../Service/addAddressService.js";

export const addAddress = async (req, res) => {
  try {
    const addresses = await addAddressService(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: addresses
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("addAddress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};