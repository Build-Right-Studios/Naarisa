import { findOrderById } from "../Query/getOrderByIdQuery.js";

export const getOrderByIdService = async (orderId, userId) => {
  const order = await findOrderById(orderId, userId);

  if (!order) {
    throw {
      status: 404,
      message: "Order not found",
    };
  }

  return order;
};