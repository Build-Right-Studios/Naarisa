import { getCouponsQuery } from "../Query/getCouponsQuery.js";

export const getCouponsService = async () => {
  const coupons = await getCouponsQuery();

  return coupons;
};