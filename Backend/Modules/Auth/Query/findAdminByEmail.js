import { Admin } from "../../../MongoDB/models.js";

export const findAdminByEmailQuery = async ({ email }) => {
  const admin = await Admin.findOne({ email });
  return admin;
};