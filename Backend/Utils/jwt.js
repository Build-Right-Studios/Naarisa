import jwt from "jsonwebtoken";

// Read the secret at call time (not import time) so it can never be captured before
// dotenv has loaded, and never fall back to a hardcoded value.
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
};

export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role
  };

  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch (err) {
    return null;
  }
};
