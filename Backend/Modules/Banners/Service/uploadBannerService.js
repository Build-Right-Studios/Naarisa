import { createBannerQuery } from "../Query/bannerQuery.js";

export const uploadBannerService = async ({
  title, desktopImage, mobileImage, cleanLink, order
}) => {
  return await createBannerQuery({
    title,
    desktopImage,
    mobileImage,
    link: cleanLink || null,
    order: order || 0
  });
};