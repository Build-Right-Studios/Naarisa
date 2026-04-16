import { Product } from "../../../MongoDB/models.js"
import { Variant } from "../../../MongoDB/models.js";
import { Coupon } from "../../../MongoDB/models.js";
import { Order } from "../../../MongoDB/models.js";

export const findProductById = async (productId) => {
  return await Product.findById(productId);
};

export const findVariantById = async (variantId) => {
  return await Variant.findById(variantId);
};

export const findCouponByCode = async (code) => {
  return await Coupon.findOne({ code: code.toUpperCase() });
};

export const deductStock = async (variantId, size, quantity) => {
  return await Variant.updateOne(
    { _id: variantId, "sizes.size": size },
    { $inc: { "sizes.$.quantity": -quantity } }
  );
};

export const createOrder = async (orderData) => {
  return await Order.create(orderData);
};