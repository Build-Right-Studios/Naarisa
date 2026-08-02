import { createBannerQuery } from "../Query/bannerQuery.js";

export const uploadBannerService = async ({
  title, desktopImage, desktopImageFileId, mobileImage, mobileImageFileId, cleanLink, order
}) => {
  return await createBannerQuery({
    title,
    desktopImage,
    desktopImageFileId,
    mobileImage,
    mobileImageFileId,
    link: cleanLink || null,
    order: order || 0
  });
};