import { deductStock } from "../Query/deductStockQuery.js";

export const deductStockForItems = async (items, session) => {   // ← added
  for (const item of items) {
    console.log("V ID :", item.variantId);
    console.log("Size :", item.size);
    console.log("Quantity :", item.quantity);
    await deductStock(item.variantId, item.size, item.quantity, session); // ← added
  }
};