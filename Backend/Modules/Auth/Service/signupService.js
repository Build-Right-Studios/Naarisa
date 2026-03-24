import bcrypt from "bcrypt";
import { getAdminByEmailInternal, createAdminInternal } from "../Internal/adminInternal.js";

export const signupService = async ({ name, email, password }) => {
  try {

    const existing = await getAdminByEmailInternal({ email });

    if (existing) {
      return {
        success: false,
        message: "Admin already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      name,
      email,
      password: hashedPassword,
    };

    const admin = await createAdminInternal(adminData);

    return {
      success: true,
      message: "Admin created successfully",
      data: admin,
    };

  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};