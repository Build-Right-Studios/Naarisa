import { verifyPaymentService } from "../Service/verifyPaymentService.js";

export const verifyPayment = async (req, res) => {
  try {
    console.log("Verify Payment called.")
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "All payment fields are required" });
    }

    const result = await verifyPaymentService({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    console.log("Verify Payment ending.")
    return res.status(200).json({
      message: "Payment verified successfully",
      ...result
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("verify-payment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};