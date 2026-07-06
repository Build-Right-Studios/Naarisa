import { Variant } from "../../../MongoDB/models.js";
import { Order } from "../../../MongoDB/models.js";

export const findVariantWithProduct = async (variantId, productId) => {
  return await Variant.findOne({
    _id: variantId,
    productId: productId,   // ensures variant belongs to product in one shot
    isActive: true
  }).populate("productId");  // brings product data along
};

export const createOrder = async (orderData, session) => {
  const [order] = await Order.create([orderData], { session }); // ← array form required with session
  return order;
};