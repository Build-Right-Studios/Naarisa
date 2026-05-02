import { Banner } from "../../../MongoDB/models.js";

export const createBannerQuery = async (data) => {
  return await Banner.create(data);
};

export const findAllBannersQuery = async () => {
  return await Banner.find().sort({ order: 1 });
};

export const findActiveBannersQuery = async () => {
  return await Banner.find({ isActive: true }).sort({ order: 1 });
};

export const findBannerByIdQuery = async (id) => {
  return await Banner.findById(id);
};

export const updateBannerQuery = async (id, data) => {
  return await Banner.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBannerQuery = async (id) => {
  return await Banner.findByIdAndDelete(id);
};