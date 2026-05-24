import { Product } from "../../../MongoDB/models.js";
import { getAllProductsService } from "../Service/getAllProductsService.js";

export const getBestSellers = async (req, res) => {
  const data = await getAllProductsService({
    isBestSeller: true,
    limit: 8,
    page: 1
  });
  return res.status(200).json({ success: true, data });
};