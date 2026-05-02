import { verifyOtpService } from "../Service/verifyOtpService.js";

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "OTP must be 6 digits" });
    }

    const result = await verifyOtpService({ phone, otp, name });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};