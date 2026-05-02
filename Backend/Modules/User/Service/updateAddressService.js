import { updateAddressQuery } from "../Query/addressQuery.js";

export const updateAddressService = async (userId, addressId, addressData) => {
  const { name, phone, line1, line2, city, state, pincode, country, label } = addressData;

  if (!name || !phone || !line1 || !city || !state || !pincode || !country) {
    throw { status: 400, message: "All address fields are required" };
  }

  const user = await updateAddressQuery(userId, addressId, {
    name,
    phone,
    line1,
    line2: line2 || "",
    city,
    state,
    pincode,
    country,
    label: label || "Home"
  });

  if (!user) throw { status: 404, message: "Address not found" };

  return user.addresses;
};