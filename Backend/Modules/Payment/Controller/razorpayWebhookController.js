import { verifyWebhookSignature, handleRazorpayWebhook } from "../Service/razorpayWebhookService.js";

export const razorpayWebhook = async (req, res) => {
  try {
    console.log("razorPay Webhook started")
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({ message: "Missing signature header" });
    }

    const isValid = verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      console.error("Webhook: invalid signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    await handleRazorpayWebhook(event);

    return res.status(200).json({ received: true });
  } catch (error) {
    // Non-2xx makes Razorpay retry the webhook; confirmation is idempotent, so retries are safe.
    console.error("Webhook processing error:", error);
    return res.status(500).json({ received: false });
  }
};