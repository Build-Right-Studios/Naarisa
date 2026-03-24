import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getAdminByEmailInternal } from "../Internal/adminInternal.js";


export const loginService = async ({ email, password }) => {
  try {

    // console.log("Email:", email);

    const user = await getAdminByEmailInternal({ email });

    // console.log("User from DB:", user);

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

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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