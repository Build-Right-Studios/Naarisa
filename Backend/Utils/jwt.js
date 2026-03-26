import jwt from "jsonwebtoken";

const JWT_TOKEN_SECRET = process.env.JWT_SECRET || "access_secret_key";

export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role
  };

  return jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
};

