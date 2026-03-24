import { verifyAccessToken } from "../Utils/jwt.js";

export const isAdmin = (req, res, next) => {
  try {
    // Case 1: Header missing
    const header = req.headers["authorization"];
    if (!header) return res.status(401).send({ success: false, message: "Access token missing" });

    const accessToken = header.replace("Bearer ", "");

    const decodedUser = verifyAccessToken(accessToken);
    if (!decodedUser)
      return res.status(401).send({ success: false, message: "Invalid or expired token" });

    req.user = decodedUser;
    
    // Case 2: user exists but not admin
    if (req.user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "You don't have enough permissions."
      });
    }
    
    next();
  } catch (err) {
    console.error("checkAdmin Error:", err);
    return res.status(500).send({
      success: false,
      message: "Internal server error."
    });
  }
};
