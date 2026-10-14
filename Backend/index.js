import "dotenv/config";
import express from "express";
import routes from "./routes.js";
import cors from "cors";
import connectMongoDB from "./config/mongodb.js";
import { cleanupExpiredOtps, cleanupPendingOrders } from "./Utils/cleanupExpiredOtps.js";
import { keepServerlive } from "./Utils/keepServerlive.js";
import { startTrackingCron } from "./Modules/Shipping/initializeTrackingJobs.js";
import { razorpayWebhook } from "./Modules/Payment/Controller/razorpayWebhookController.js";

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://naarisa-frontend-git-dev-aryeshs-projects.vercel.app',
    'https://naarisa-admin-git-dev-aryeshs-projects.vercel.app',
    'https://naarisa-admin.vercel.app',
    'https://www.naarisa.com'
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.post(
  "/api/payment/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json());

await connectMongoDB();

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
  res.json("Server is running fine.")
})

keepServerlive();
cleanupExpiredOtps();
cleanupPendingOrders();
startTrackingCron();