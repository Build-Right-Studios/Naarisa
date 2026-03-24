import bcrypt from "bcrypt";
import { getAdminByEmailInternal } from "../Internal/adminInternal.js";
import { generateAccessToken } from "../../../Utils/jwt.js";

export const loginService = async ({ email, password }) => {
  try {
    const user = await getAdminByEmailInternal({ email });
    if (!user) {
      return {
        success: false,
        message: "Admin not found",
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    const token = generateAccessToken(user);

    return {
      success: true,
      message: "Login successful",
      token,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};