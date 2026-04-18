import { Order } from "../../../MongoDB/models.js";

export const findOrderByRazorpayOrderId = async (razorpayOrderId) => {
  return await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });
};

export const confirmOrder = async (orderId, razorpayPaymentId) => {
  return await Order.findByIdAndUpdate(
    orderId,
    {
      "payment.razorpayPaymentId": razorpayPaymentId,
      "payment.status": "paid",
      "payment.paidAt": new Date(),
      "status": "confirmed",
      $push: {
        timeline: {
          status: "confirmed",
          timestamp: new Date()
        }
      }
    },
    { new: true }
  );
};