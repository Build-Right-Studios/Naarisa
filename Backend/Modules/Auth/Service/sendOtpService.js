import crypto from "crypto";
import { findUserByPhone, createUser, updateUserOtp } from "../Query/otpQuery.js";
import { sendSMS } from "../../../config/twilio.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const sendOtpService = async (phone) => {
  // Generate OTP
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if user exists
  let user = await findUserByPhone(phone);

  if (!user) {
    // New user — create with placeholder name
    user = await createUser({
      phone,
      name: "User",
      otp: { code: hashedOtp, expiresAt }
    });
  } else {
    // Existing user — just update OTP
    await updateUserOtp(phone, hashedOtp, expiresAt);
  }

  // Send OTP via Twilio
  await sendSMS(phone, `Your Naarisa OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`);

  return {
    isNewUser: user.name === "User",
    message: "OTP sent successfully"
  };
};