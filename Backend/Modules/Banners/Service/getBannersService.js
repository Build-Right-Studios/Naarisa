import { findAllBannersQuery, findActiveBannersQuery } from "../Query/bannerQuery.js";

export const getBannersService = async () => {
  const banners = await findAllBannersQuery();
  if (!banners) throw { status: 404, message: "No banners found" };
  return banners;
};

export const getActiveBannersService = async () => {
  const banners = await findActiveBannersQuery();
  if (!banners) throw { status: 404, message: "No active banners found" };
  return banners;
};