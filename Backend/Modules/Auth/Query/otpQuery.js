import { User } from "../../../MongoDB/models.js";

export const findUserByPhone = async (phone) => {
  return await User.findOne({ phone });
};

export const createUser = async (data) => {
  return await User.create(data);
};

export const updateUserOtp = async (phone, otp, expiresAt) => {
  return await User.findOneAndUpdate(
    { phone },
    { otp: { code: otp, expiresAt } },
    { new: true }
  );
};

export const clearUserOtp = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $unset: { otp: 1 } },
    { new: true }
  );
};

export const updateUserName = async (userId, name) => {
  return await User.findByIdAndUpdate(
    userId,
    { name },
    { new: true }
  );
};