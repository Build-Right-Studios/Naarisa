import { Admin } from "../../../MongoDB/models.js";

export const createAdminQuery = async ({ name, email, password }) => {
  const admin = await Admin.create({ name, email, password });
  return admin;
};