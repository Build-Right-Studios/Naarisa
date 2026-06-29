import cron from "node-cron";
import axios from "axios";

export const keepServerlive = () => {
  cron.schedule("*/30 * * * * *", async () => {
    try {
      const res = await axios.get("https://naarisa-backend-main.onrender.com");

      console.log(
        `[KeepAlive] ${new Date().toISOString()} - Pinged successfully (${res.status})`
      );
    } catch (err) {
      console.error(
        `[KeepAlive] ${new Date().toISOString()} - Ping failed:`,
        err.message
      );
    }
  });

  console.log("KeepAlive cron started (every 30 seconds)");
};