import { User } from "../../../MongoDB/models.js";
import { updateUserProfile } from "../Query/profileQuery.js";

export const updateProfileService = async (userId, { name, email }) => {
  if (!name && !email) {
    throw { status: 400, message: "Nothing to update" };
  }

  const updates = {};
  if (name) updates.name = name.trim();

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();

    // Only check uniqueness if the new email is different from the current one
    const currentUser = await User.findById(userId);
    if (!currentUser) throw { status: 404, message: "User not found" };

    if (normalizedEmail !== currentUser.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== userId) {
        throw { status: 400, message: "Email already in use" };
      }
    }

    updates.email = normalizedEmail;
  }

  const user = await updateUserProfile(userId, updates);
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};
