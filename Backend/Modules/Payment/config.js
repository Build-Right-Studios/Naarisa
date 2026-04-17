import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  // key_id: "rzp_test_Sazevn3tG4preL",
  key_secret: process.env.RAZORPAY_KEY_SECRET
  // key_secret: "lY5DEXBY7REEZiihnQLAPP55"
});