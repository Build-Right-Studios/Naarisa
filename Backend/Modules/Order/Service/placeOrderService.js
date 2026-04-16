import Razorpay from "razorpay";
import {
  findProductById,
  findVariantById,
  findCouponByCode,
  deductStock,
  createOrder
} from "../Query/placeOrderQuery.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// --- Resolve address ---
export const resolveAddress = (user, address, addressId) => {
  if (addressId) {
    const saved = user.addresses.id(addressId);
    if (!saved) throw { status: 404, message: "Address not found" };
    return {
      name: saved.name,
      phone: saved.phone,
      line1: saved.line1,
      line2: saved.line2 || "",
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode
    };
  }
  if (address) return address;
  throw { status: 400, message: "Delivery address is required" };
};

// --- Validate items and build order items ---
export const buildOrderItems = async (items) => {
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const { productId, variantId, size, quantity } = item;

    if (!productId || !variantId || !size || !quantity) {
      throw { status: 400, message: "Each item needs productId, variantId, size and quantity" };
    }

    // Fetch product
    const product = await findProductById(productId);
    if (!product) {
      throw { status: 404, message: `Product not found: ${productId}` };
    }

    // Fetch variant
    const variant = await findVariantById(variantId);
    if (!variant || !variant.isActive) {
      throw { status: 404, message: `Variant not found or inactive: ${variantId}` };
    }

    // Check variant belongs to product
    if (variant.productId.toString() !== productId) {
      throw { status: 400, message: "Variant does not belong to this product" };
    }

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
      variantName: variant.color.name
    });
  }

  return { orderItems, subtotal };
};

// --- Validate and apply coupon ---
export const applyCoupon = async (couponCode, subtotal) => {
  let discount = 0;
  let appliedCoupon = null;

  if (!couponCode) return { discount, appliedCoupon };

  const coupon = await findCouponByCode(couponCode);

  if (!coupon) {
    throw { status: 404, message: "Invalid coupon code" };
  }

  if (!coupon.isActive) {
    throw { status: 400, message: "Coupon is no longer active" };
  }

  if (coupon.expiryDate < new Date()) {
    throw { status: 400, message: "Coupon has expired" };
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    throw {
      status: 400,
      message: `Minimum order amount for this coupon is ₹${coupon.minOrderValue}`
    };
  }

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  // Discount can never exceed subtotal
  discount = Math.min(discount, subtotal);

  appliedCoupon = {
    code: coupon.code,
    discountAmount: discount
  };

  return { discount, appliedCoupon };
};

// --- Create Razorpay order ---
export const createRazorpayOrder = async (total) => {
  return await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  });
};

// --- Deduct stock for all items ---
export const deductStockForItems = async (items) => {
  for (const item of items) {
    await deductStock(item.variantId, item.size, item.quantity);
  }
};

// --- Save order ---
export const saveOrder = async ({
  userId,
  orderItems,
  appliedCoupon,
  pricing,
  deliveryAddress,
  razorpayOrderId
}) => {
  return await createOrder({
    user: userId,
    items: orderItems,
    coupon: appliedCoupon,
    pricing,
    address: deliveryAddress,
    payment: {
      razorpayOrderId,
      status: "pending"
    },
    status: "payment_pending",
    timeline: [{ status: "payment_pending", timestamp: new Date() }]
  });
};