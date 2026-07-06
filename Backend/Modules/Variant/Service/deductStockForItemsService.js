import { deductStock } from "../Query/deductStockQuery.js";

export const deductStockForItems = async (items, session) => {   // ← added
  for (const item of items) {
    await deductStock(item.variantId, item.size, item.quantity, session); // ← added
  }
};