import { createBannerQuery } from "../Query/bannerQuery.js";

export const uploadBannerService = async ({
  title, desktopImage, mobileImage, link, order
}) => {
  return await createBannerQuery({
    title,
    desktopImage,
    mobileImage,
    link: link || null,
    order: order || 0
  });
};