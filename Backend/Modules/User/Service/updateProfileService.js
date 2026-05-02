import { User } from "../../../MongoDB/models.js";
import { updateUserProfile } from "../Query/profileQuery.js";

export const updateProfileService = async (userId, { name, email }) => {
  if (!name && !email) {
    throw { status: 400, message: "Nothing to update" };
  }

  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();

  // Check email not already taken by another user
  if (email) {
    const existing = await User.findOne({ email: updates.email });
    if (existing && existing._id.toString() !== userId) {
      throw { status: 400, message: "Email already in use" };
    }
  }

  const user = await updateUserProfile(userId, updates);
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};