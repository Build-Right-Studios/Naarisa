import { findDeliveredOrders } from "../Query/getOrdersQuery.js";

export const getDeliveredOrdersService = async ({ page, limit }) => {
  const filter = {
    status: "delivered"
  };

  const skip = (page - 1) * limit;
  const sortOption = { createdAt: -1 };

  const { orders, total } = await findDeliveredOrders({ filter, skip, limit, sortOption });

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};