import { findBannerByIdQuery, deleteBannerQuery } from "../Query/bannerQuery.js";

export const deleteBannerService = async (id) => {
  const banner = await findBannerByIdQuery(id);
  if (!banner) throw { status: 404, message: "Banner not found" };

  // ✅ No Cloudinary delete — banner is soft deleted, image stays
  await deleteBannerQuery(id);
};