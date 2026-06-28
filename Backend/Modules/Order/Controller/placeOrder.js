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

    // Resolve address
    // const deliveryAddress = resolveAddress(req.user, address, addressId);

    // Validate items + build order items
    // const { orderItems, subtotal } = await buildOrderItems(items);

    // Apply coupon
    // const { discount, appliedCoupon } = await applyCoupon(couponCode, subtotal);

    // const total = subtotal - discount;

    // Create Razorpay order
    // const razorpayOrder = await createRazorpayOrder(total);

    // Deduct stock
    // await deductStockForItems(items);

    // Save order to DB
    // const order = await saveOrder({
    //   userId: req.user._id,
    //   orderItems,
    //   appliedCoupon,
    //   pricing: { subtotal, discount, total },
    //   deliveryAddress,
    //   razorpayOrderId: razorpayOrder.id
    // });

    // Respond to frontend

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