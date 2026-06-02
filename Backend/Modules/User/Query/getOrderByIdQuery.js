import { Order } from "../../../MongoDB/models.js";

export const findOrderById = async (orderId, userId) => {
  return await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate("items.variant");
};