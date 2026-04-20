import { findOrderById } from "../Query/getOrdersQuery.js";

export const getOrderByIdService = async (orderId) => {
  const order = await findOrderById(orderId);
  if (!order) throw { status: 404, message: "Order not found" };
  return order;
};