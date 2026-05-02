import { sendOtpService } from "../Service/sendOtpService.js";

export const sendOtp = async (req, res) => {
  try {
    console.log("Backend Reached.")
    const { phone } = req.body;
    console.log("Body Reached.")
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Enter a valid 10 digit phone number" });
    }
    console.log("Checks Done.")

    const result = await sendOtpService(phone);

    console.log("Result Reached.")

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};