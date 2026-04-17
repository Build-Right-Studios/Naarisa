export const resolveAddress = async (user, address, addressId) => {
  if (addressId) {
    const saved = user.addresses.id(addressId);
    if (!saved) throw { status: 404, message: "Address not found" };
    return {
      name: saved.name,
      phone: saved.phone,
      line1: saved.line1,
      line2: saved.line2 || "",
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
      country: saved.country
    };
  }
  if (address) return address;
  throw { status: 400, message: "Delivery address is required" };
};