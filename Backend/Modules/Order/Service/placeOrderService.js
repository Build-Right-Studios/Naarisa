import mongoose from "mongoose";
import { Variant } from "../../../MongoDB/models.js";

import { findVariantWithProduct, createOrder } from "../Query/placeOrderQuery.js";
import { resolveAddress } from "../../User/Service/resolveAddressService.js";
import { createRazorpayOrder } from "../../Payment/Service/createRazorpayOrder.js";
import { applyCoupon } from "../../Coupons/Service/applyCouponService.js";
import { deductStockForItems } from "../../Variant/Service/deductStockForItemsService.js";
import { generateOrderId } from "../../../Utils/generateOrderId.js";
import { checkCodServiceabilityService } from "./checkCodServiceabilityService.js";
import { notifyOrderConfirmed } from "../../Payment/Service/orderConfirmationService.js";

const PARTIAL_COD_ADVANCE_AMOUNT = Number(process.env.PARTIAL_COD_ADVANCE_AMOUNT || 200);
const PAYMENT_MODES = ["Prepaid", "COD", "PartialCOD"];

const buildOrderItems = async (items) => {
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const { productId, variantId, size, quantity } = item;
    if (!productId || !variantId || !size || !quantity) {
      throw { status: 400, message: "Each item needs productId, variantId, size and quantity" };
    }

    const variant = await findVariantWithProduct(variantId, productId);
    if (!variant) {
      throw {
        status: 404,
        message: `Product or variant not found, inactive, or mismatch: ${variantId}`
      };
    }

    const product = variant.productId;
    const sizeEntry = variant.sizes.find(s => s.size === size);
    if (!sizeEntry) {
      throw { status: 400, message: `Size ${size} not available for this variant` };
    }
    if (sizeEntry.quantity < quantity) {
      throw {
        status: 400,
        message: `Insufficient stock for ${product.name} - ${variant.color.name} - ${size}. Available: ${sizeEntry.quantity}`
      };
    }

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

// Decides Prepaid vs COD vs PartialCOD and the resulting money split.
// Re-checked server-side, never trust the client's payment mode blindly.
const resolvePaymentPlan = async ({ paymentMode, total, pincode }) => {
  const mode = PAYMENT_MODES.includes(paymentMode) ? paymentMode : "Prepaid";

  if (mode === "Prepaid") {
    return { mode, advanceAmount: total, codAmount: 0 };
  }

  const serviceability = await checkCodServiceabilityService(pincode);
  if (!serviceability.codAvailable) {
    throw {
      status: 400,
      message: "Cash on Delivery is not available for this pincode. Please choose Prepaid.",
    };
  }

  if (mode === "COD") {
    return { mode, advanceAmount: 0, codAmount: total };
  }

  // PartialCOD — flat ₹200 advance, capped at the order total
  const advanceAmount = Math.min(PARTIAL_COD_ADVANCE_AMOUNT, total);
  if (advanceAmount >= total) {
    // Advance would cover the whole order — a ₹0 COD leg makes no sense,
    // fall back to full COD instead.
    return { mode: "COD", advanceAmount: 0, codAmount: total };
  }
  return { mode: "PartialCOD", advanceAmount, codAmount: total - advanceAmount };
};

const saveOrder = async ({
  userId,
  orderItems,
  userEmail,
  appliedCoupon,
  pricing,
  deliveryAddress,
  razorpayOrderId,
  paymentPlan,
}, session) => {
  const customOrderId = generateOrderId();

  // Full COD never touches Razorpay — nothing to wait on, so it's
  // confirmed immediately. Prepaid/PartialCOD wait for the handler+webhook.
  const initialStatus = paymentPlan.mode === "COD" ? "confirmed" : "payment_pending";

  return await createOrder({
    customOrderId,
    user: userId,
    items: orderItems,
    email: userEmail,
    coupon: appliedCoupon,
    pricing,
    address: { ...deliveryAddress, email: userEmail || null },
    payment: {
      mode: paymentPlan.mode,
      razorpayOrderId: razorpayOrderId || null,
      status: paymentPlan.mode === "COD" ? "not_applicable" : "pending",
      advanceAmount: paymentPlan.advanceAmount,
      codAmount: paymentPlan.codAmount,
    },
    status: initialStatus,
    timeline: [{ status: initialStatus, timestamp: new Date() }]
  }, session);
};

export const placeOrderService = async (orderData) => {
  const { user, items, address, addressId, couponCode, paymentMode } = orderData;

  const deliveryAddress = await resolveAddress(user, address, addressId);
  const { orderItems, subtotal } = await buildOrderItems(items);
  const { discount, appliedCoupon } = await applyCoupon(couponCode, subtotal, user._id);
  const total = subtotal - discount;

  const paymentPlan = await resolvePaymentPlan({
    paymentMode,
    total,
    pincode: deliveryAddress.pincode,
  });

  // Only hit Razorpay when money actually needs to move online.
  const razorpayOrder =
    paymentPlan.advanceAmount > 0 ? await createRazorpayOrder(paymentPlan.advanceAmount) : null;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await deductStockForItems(items, session);

    const order = await saveOrder({
      userId: user._id,
      orderItems,
      appliedCoupon,
      pricing: { subtotal, discount, total },
      deliveryAddress,
      razorpayOrderId: razorpayOrder?.id,
      paymentPlan,
      userEmail: deliveryAddress.email || user.email,
    }, session);

    await session.commitTransaction();

    // Full COD confirms immediately with no Razorpay step — fire the same
    // notification path Prepaid/PartialCOD get after payment verification.
    if (paymentPlan.mode === "COD") {
      notifyOrderConfirmed(order).catch((err) =>
        console.error("Failed to notify COD order confirmation:", err)
      );
    }

    return {
      orderId: order._id,
      customOrderId: order.customOrderId,
      paymentMode: paymentPlan.mode,
      razorpayOrderId: razorpayOrder?.id || null,
      amount: razorpayOrder?.amount || 0,
      currency: razorpayOrder?.currency || "INR",
      keyId: razorpayOrder ? process.env.RAZORPAY_KEY_ID : null,
      pricing: { subtotal, discount, total },
      advanceAmount: paymentPlan.advanceAmount,
      codAmount: paymentPlan.codAmount,
      requiresPayment: Boolean(razorpayOrder),
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Place Order Error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};