import { Variant } from "../../../MongoDB/models.js";

export const deductStock = async (variantId, size, quantity, session) => {

  // Fetch the variant for debugging
  const variant = await Variant.findById(variantId).session(session);

  if (!variant) {
    throw {
      status: 404,
      message: "Variant not found"
    };
  }

  console.log("========================================");
  console.log("Requested Size:", JSON.stringify(size));
  console.log("Requested Quantity:", quantity);

  console.log(
    variant.sizes.map(s => ({
      stored: JSON.stringify(s.size),
      quantity: s.quantity,
      equal: s.size === size
    }))
  );

  const result = await Variant.updateOne(
    {
      _id: variantId,
      sizes: {
        $elemMatch: {
          size,
          quantity: { $gte: quantity }
        }
      }
    },
    {
      $inc: {
        "sizes.$.quantity": -quantity
      }
    },
    { session }
  );

  console.log("Update Result:", result);

  const updatedVariant = await Variant.findById(variantId).session(session);

  console.log("Updated Sizes:");
  console.log(
    updatedVariant.sizes.map(s => ({
      size: s.size,
      quantity: s.quantity
    }))
  );

  console.log("========================================");

  if (result.matchedCount === 0) {
    throw {
      status: 409,
      message: "Stock changed, please try again"
    };
  }

  return result;
};