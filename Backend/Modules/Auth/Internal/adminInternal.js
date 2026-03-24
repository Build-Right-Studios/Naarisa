import { findAdminByEmailQuery } from "../Query/findAdminByEmail.js";
import { createAdminQuery } from "../Query/createAdmin.js";

export const getAdminByEmailInternal = async (userData) => {
  const { email } = userData;
  const admin = await findAdminByEmailQuery({ email });
  return admin;
};

export const createAdminInternal = async ({ name, email, password }) => {
  const admin = await createAdminQuery({ name, email, password });
  return admin;
};