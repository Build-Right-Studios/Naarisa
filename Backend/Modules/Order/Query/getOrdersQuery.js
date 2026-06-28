import { Order } from "../../../MongoDB/models.js";

export const findActiveOrders = async ({ filter, skip, limit, sortOption }) => {
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("user items pricing status payment.status delivery.status createdAt"),
    Order.countDocuments(filter)
  ]);
  return { orders, total };
};

export const findDeliveredOrders = async ({ filter, skip, limit, sortOption }) => {
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("user items pricing status payment.status delivery.status createdAt"),
    Order.countDocuments(filter)
  ]);
  return { orders, total };
};

export const findOrderById = async (orderId) => {
  return await Order.findById(orderId)
    .populate({
      path: "user",
      select: "name email phone"
    });
};