import { setDefaultAddressQuery } from "../Query/addressQuery.js";

export const setDefaultAddressService = async (userId, addressId) => {
  const user = await setDefaultAddressQuery(userId, addressId);
  if (!user) throw { status: 404, message: "Address not found" };
  return user.addresses;
};