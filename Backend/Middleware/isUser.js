import jwt from "jsonwebtoken";
import { User } from "../MongoDB/models.js";

export const isUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-otp");
    // console.log(req.user._id)

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    next();

  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};