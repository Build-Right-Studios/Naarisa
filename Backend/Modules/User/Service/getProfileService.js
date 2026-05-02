import { findUserById } from "../Query/profileQuery.js";

export const getProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};