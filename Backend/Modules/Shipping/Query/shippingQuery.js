import { Order } from "../../../MongoDB/models.js";

export const findOrderById = async (orderId) => {
  return await Order.findById(orderId);
};

export const updateDelivery = async (orderId, deliveryData, timeline) => {
  return await Order.findByIdAndUpdate(
    orderId,
    {
      delivery: deliveryData,
      status: "processing",
      $push: {
        timeline
      }
    },
    {
      new: true
    }
  );
};