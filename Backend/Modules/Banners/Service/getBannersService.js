import { findAllBannersQuery, findActiveBannersQuery } from "../Query/bannerQuery.js";
import { cloudinaryTransform } from "../../../Utils/cloudinaryTransform.js";

export const getBannersService = async () => {
  const banners = await findAllBannersQuery();
  if (!banners) throw { status: 404, message: "No banners found" };

  const optimized = banners.map((banner) => ({
    ...banner,
    desktopImage: cloudinaryTransform(banner.desktopImage),
    mobileImage: cloudinaryTransform(banner.mobileImage),
  }));

  return optimized;
};

export const getActiveBannersService = async () => {
  const banners = await findActiveBannersQuery();

  if (!banners) throw { status: 404, message: "No active banners found" };

  const optimized = banners.map((banner) => ({
    ...banner,
    desktopImage: cloudinaryTransform(banner.desktopImage),
    mobileImage: cloudinaryTransform(banner.mobileImage),
  }));

  return optimized;
};