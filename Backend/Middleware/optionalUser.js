import jwt from "jsonwebtoken";
import { User } from "../MongoDB/models.js";

export const optionalUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        // No token → guest user
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-otp");

        if (!user || !user.isActive) {
            req.user = null;
            return next();
        }

        req.user = user;
        next();

    } catch (error) {
        // Invalid/expired token → treat as guest
        req.user = null;
        next();
    }
};