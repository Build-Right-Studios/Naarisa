import { findUserAddresses } from "../Query/addressQuery.js";

export const getAddressesService = async (userId) => {
  const addresses = await findUserAddresses(userId);
  return addresses;
};