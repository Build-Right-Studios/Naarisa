import { deductStock } from "../Query/deductStockQuery.js"

export const deductStockForItems = async (items) => {
  for (const item of items) {
    await deductStock(item.variantId, item.size, item.quantity);
  }
};