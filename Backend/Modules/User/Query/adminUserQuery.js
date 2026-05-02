import { User } from "../../../MongoDB/models.js";
import { Order } from "../../../MongoDB/models.js";

export const findAllUsersQuery = async ({ skip, limit }) => {
  const [users, total] = await Promise.all([
    User.find({ isActive: true })
      .select("name phone email createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ isActive: true })
  ]);
  return { users, total };
};

export const findUserWithOrdersQuery = async (userId) => {
  const [user, orders] = await Promise.all([
    User.findById(userId).select("-otp"),
    Order.find({ user: userId })
      .select("items pricing status payment.status delivery.status createdAt")
      .sort({ createdAt: -1 })
  ]);
  return { user, orders };
};