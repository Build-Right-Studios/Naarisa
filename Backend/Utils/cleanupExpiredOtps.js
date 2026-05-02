import cron from "node-cron";
import { User } from "../MongoDB/models.js";

export const cleanupExpiredOtps = () => {
  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await User.updateMany(
        { "otp.expiresAt": { $lt: new Date() } },
        { $unset: { otp: 1 } }
      );
      console.log(`Cleaned up ${result.modifiedCount} expired OTPs`);
    } catch (error) {
      console.error("OTP cleanup job failed:", error);
    }
  });
};