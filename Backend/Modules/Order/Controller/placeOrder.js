import mongoose from "mongoose";
import { placeOrderService } from "../Service/placeOrderService.js";

export const placeOrder = async (req, res) => {
  try {
    const { items, address, addressId, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address is mising" });
    }
    const user = req.user;

    const placedOrder = await placeOrderService({ user, items, address, addressId, couponCode })

    return res.status(201).json({
      message: "Order created successfully",
      ...placedOrder
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("place-order error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};