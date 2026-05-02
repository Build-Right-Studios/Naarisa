import { findBannerByIdQuery, deleteBannerQuery } from "../Query/bannerQuery.js";
import { cloudinary } from "../../../config/cloudinary.js";

export const deleteBannerService = async (id) => {
  const banner = await findBannerByIdQuery(id);
  if (!banner) throw { status: 404, message: "Banner not found" };

  // Extract public_id from Cloudinary URL and delete images
  const getPublicId = (url) => {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    return `${folder}/${file.split(".")[0]}`;
  };

  await cloudinary.uploader.destroy(getPublicId(banner.desktopImage));
  await cloudinary.uploader.destroy(getPublicId(banner.mobileImage));

  await deleteBannerQuery(id);
};