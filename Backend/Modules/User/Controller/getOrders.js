import { Order } from "../../../MongoDB/models.js";

export const getOrders = async (req, res) => {
  try {
    const user_id = req.user._id;
    const orders = await Order.find({
      user: user_id
    })
      .sort({ createdAt: -1 });

    console.log("Orders : ", orders)

    return res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};