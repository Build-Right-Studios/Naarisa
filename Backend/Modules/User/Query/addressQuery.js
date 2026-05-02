import { User } from "../../../MongoDB/models.js";

export const findUserAddresses = async (userId) => {
  const user = await User.findById(userId).select("addresses");
  if (!user) throw { status: 404, message: "User not found" };
  return user.addresses;
};

export const addAddressQuery = async (userId, address) => {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { addresses: address } },
    { new: true }
  ).select("addresses");
};

export const updateAddressQuery = async (userId, addressId, data) => {
  return await User.findOneAndUpdate(
    { _id: userId, "addresses._id": addressId },
    { $set: { "addresses.$": { ...data, _id: addressId } } },
    { new: true }
  ).select("addresses");
};

export const deleteAddressQuery = async (userId, addressId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  ).select("addresses");
};

export const setDefaultAddressQuery = async (userId, addressId) => {
  // First unset all defaults then set the selected one
  await User.updateOne(
    { _id: userId },
    { $set: { "addresses.$[].isDefault": false } }
  );
  return await User.findOneAndUpdate(
    { _id: userId, "addresses._id": addressId },
    { $set: { "addresses.$.isDefault": true } },
    { new: true }
  ).select("addresses");
};