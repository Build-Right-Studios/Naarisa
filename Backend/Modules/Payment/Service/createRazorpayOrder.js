import { razorpay } from "../config.js";

export const createRazorpayOrder = async (total) => {
  return await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  });
};