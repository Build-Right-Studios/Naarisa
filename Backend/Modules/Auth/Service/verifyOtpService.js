import crypto from "crypto";
import jwt from "jsonwebtoken";
import { findUserByPhone, clearUserOtp, updateUserName } from "../../User/Query/userQuery.js";

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const verifyOtpService = async ({ phone, otp, name }) => {
  // Find user
  const user = await findUserByPhone(phone);
  if (!user) throw { status: 404, message: "User not found" };

  // Check OTP exists
  if (!user.otp?.code || !user.otp?.expiresAt) {
    throw { status: 400, message: "OTP not requested" };
  }

  // Check expiry
  if (user.otp.expiresAt < new Date()) {
    throw { status: 400, message: "OTP has expired" };
  }

  // Compare hashed OTP
  const hashedOtp = hashOtp(otp);
  if (hashedOtp !== user.otp.code) {
    throw { status: 400, message: "Invalid OTP" };
  }

  // Clear OTP from DB
  await clearUserOtp(user._id);

  // If new user and name provided — update name
  if (name && user.name === "User") {
    await updateUserName(user._id, name);
  }

  // Generate JWT
  const token = generateToken(user._id);

  return {
    token,
    isNewUser: user.name === "User",
    user: {
      id: user._id,
      name: name || user.name,
      phone: user.phone,
      email: user.email
    }
  };
};