import cron from "node-cron";
import axios from "axios";

// Free Render instances sleep after 15 minutes idle, which also stops the scheduled jobs.
// Set KEEP_ALIVE_URL to this server's own public URL only on a free instance; paid
// instances stay up and don't need it.
export const keepServerlive = () => {
  const url = process.env.KEEP_ALIVE_URL;
  if (!url) return;

  cron.schedule("*/30 * * * * *", async () => {
    try {
      const res = await axios.get(url);

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

  console.log(`KeepAlive cron started for ${url} (every 30 seconds)`);
};
