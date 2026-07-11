import mongoose from "mongoose";
import { Variant } from "../../../MongoDB/models.js";

import { findVariantWithProduct, createOrder } from "../Query/placeOrderQuery.js";
import { resolveAddress } from "../../User/Service/resolveAddressService.js";
import { createRazorpayOrder } from "../../Payment/Service/createRazorpayOrder.js";
import { applyCoupon } from "../../Coupons/Service/applyCouponService.js";
import { deductStockForItems } from "../../Variant/Service/deductStockForItemsService.js";
import { generateOrderId } from "../../../Utils/generateOrderId.js";

const buildOrderItems = async (items) => {
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const { productId, variantId, size, quantity } = item;
    if (!productId || !variantId || !size || !quantity) {
      throw { status: 400, message: "Each item needs productId, variantId, size and quantity" };
    }
    const variant_trial = await Variant.findById(variantId);
    console.log(JSON.stringify(variant_trial.sizes, null, 2));

    // Fetch product
    const variant = await findVariantWithProduct(variantId, productId);
    if (!variant) {
      throw {
        status: 404,
        message: `Product or variant not found, inactive, or mismatch: ${variantId}`
      };
    }

    // Product data comes from populate
    const product = variant.productId;

    // Find size entry
    const sizeEntry = variant.sizes.find(s => s.size === size);
    if (!sizeEntry) {
      throw { status: 400, message: `Size ${size} not available for this variant` };
    }

    // Check stock
    if (sizeEntry.quantity < quantity) {
      throw {
        status: 400,
        message: `Insufficient stock for ${product.name} - ${variant.color.name} - ${size}. Available: ${sizeEntry.quantity}`
      };
    }

    // Snapshot price
    const priceAtOrder = variant.discountPrice ?? product.basePrice;
    subtotal += priceAtOrder * quantity;

    orderItems.push({
      product: productId,
      variant: variantId,
      size,
      quantity,
      priceAtOrder,
      productName: product.name,
      variantName: variant.color.name,
      image: variant.images?.[0]?.url || null
    });
  }

  return { orderItems, subtotal };
};

const saveOrder = async ({
  userId,
  orderItems,
  userEmail,
  appliedCoupon,
  pricing,
  deliveryAddress,
  razorpayOrderId
}, session) => {
  const customOrderId = generateOrderId();

  return await createOrder({
    customOrderId,
    user: userId,
    items: orderItems,
    email: userEmail,
    coupon: appliedCoupon,
    pricing,
    address: { ...deliveryAddress, email: deliveryAddress.email || null },
    payment: {
      razorpayOrderId,
      status: "pending"
    },
    status: "payment_pending",
    timeline: [{ status: "payment_pending", timestamp: new Date() }]
  }, session);
};

export const placeOrderService = async (orderData) => {

  const { user, items, address, addressId, couponCode } = orderData;

  const deliveryAddress = await resolveAddress(user, address, addressId);
  const { orderItems, subtotal } = await buildOrderItems(items);
  console.log("Order Items : ", orderItems);
  const { discount, appliedCoupon } = await applyCoupon(couponCode, subtotal);
  const total = subtotal - discount;
  const razorpayOrder = await createRazorpayOrder(total);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deductItems = await deductStockForItems(items, session);

    // console.log("Deduct Items : ", deductItems)

    const order = await saveOrder({
      userId: user._id,
      orderItems,
      appliedCoupon,
      pricing: { subtotal, discount, total },
      deliveryAddress,
      razorpayOrderId: razorpayOrder.id,
      userEmail: deliveryAddress.email || user.email,
    }, session);

    await session.commitTransaction();

    return {
      orderId: order._id,
      customOrderId: order.customOrderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      pricing: { subtotal, discount, total }
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Place Order Error:", error);
    throw error;
  } finally {
    session.endSession();
  }

  // await deductStockForItems(items);

  // const order = await saveOrder({
  //   userId: user._id,
  //   orderItems,
  //   appliedCoupon,
  //   pricing: { subtotal, discount, total },
  //   deliveryAddress,
  //   razorpayOrderId: razorpayOrder.id,
  //   userEmail: deliveryAddress.email || user.email,
  // });

  // return {
  //   orderId: order._id,
  //   customOrderId: order.customOrderId,
  //   razorpayOrderId: razorpayOrder.id,
  //   amount: razorpayOrder.amount,
  //   currency: razorpayOrder.currency,
  //   keyId: process.env.RAZORPAY_KEY_ID,
  //   pricing: { subtotal, discount, total }
  // }
} 