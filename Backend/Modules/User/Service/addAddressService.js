import { addAddressQuery } from "../Query/addressQuery.js";

export const addAddressService = async (userId, addressData) => {
  const { name, phone, line1, line2, city, state, pincode, country, label, isDefault } = addressData;

  if (!name || !phone || !line1 || !city || !state || !pincode || !country) {
    throw { status: 400, message: "All address fields are required" };
  }

  const user = await addAddressQuery(userId, {
    name,
    phone,
    line1,
    line2: line2 || "",
    city,
    state,
    pincode,
    country,
    label: label || "Home",
    isDefault: isDefault || false
  });

  return user.addresses;
};