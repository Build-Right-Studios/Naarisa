import { findUserWithOrdersQuery } from "../Query/adminUserQuery.js";

export const adminGetUserByIdService = async (userId) => {
  const { user, orders } = await findUserWithOrdersQuery(userId);

  if (!user) throw { status: 404, message: "User not found" };

  return {
    user,
    orders,
    totalOrders: orders.length,
    totalSpent: orders
      .filter(o => o.payment.status === "paid")
      .reduce((sum, o) => sum + o.pricing.total, 0)
  };
};