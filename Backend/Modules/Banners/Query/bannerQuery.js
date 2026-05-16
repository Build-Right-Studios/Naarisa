import { Banner } from "../../../MongoDB/models.js";

export const createBannerQuery = async (data) => {
  return await Banner.create(data);
};

export const findAllBannersQuery = async () => {
  return await Banner.find({ isDeleted: false }).sort({ order: 1 }); // ✅ exclude soft deleted
};

export const findActiveBannersQuery = async () => {
  return await Banner.find({ isActive: true, isDeleted: false }).sort({ order: 1 }); // ✅
};

export const findBannerByIdQuery = async (id) => {
  return await Banner.findOne({ _id: id, isDeleted: false }); // ✅ exclude soft deleted
};

export const updateBannerQuery = async (id, data) => {
  return await Banner.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBannerQuery = async (id) => {
  return await Banner.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true }); // ✅ soft delete
};