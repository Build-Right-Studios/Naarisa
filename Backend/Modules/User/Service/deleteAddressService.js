import { deleteAddressQuery } from "../Query/addressQuery.js";

export const deleteAddressService = async (userId, addressId) => {
  const user = await deleteAddressQuery(userId, addressId);
  if (!user) throw { status: 404, message: "Address not found" };
  return user.addresses;
};