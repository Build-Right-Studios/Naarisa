import { User } from "../../../MongoDB/models.js";

export const findUserById = async (userId) => {
  return await User.findById(userId).select("-otp");
};

export const updateUserProfile = async (userId, data) => {
  return await User.findByIdAndUpdate(
    userId,
    data,
    { new: true }
  ).select("-otp");
};