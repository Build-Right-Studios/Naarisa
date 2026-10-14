import { verifyAccessToken } from "../Utils/jwt.js";
import { Admin } from "../MongoDB/models.js";

export const isAdmin = async (req, res, next) => {
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

    // Case 3: admin account no longer exists (deleted/revoked) — don't trust the token alone
    const adminExists = await Admin.exists({ _id: req.user.id });
    if (!adminExists) {
      return res.status(401).send({ success: false, message: "Invalid or expired token" });
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
