import express from "express";
import routes from "./routes.js";
import dotenv from "dotenv";
import cors from "cors";
import connectMongoDB from "./config/mongodb.js";
import { cleanupExpiredOtps } from "./Utils/cleanupExpiredOtps.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://naarisa-admin-git-internal-aryeshs-projects.vercel.app',
    'https://naarisa-admin.vercel.app'
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

await connectMongoDB();

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
  res.json("Server is running fine.")
})

app.get("/", (req, res) => {
  res.json("Server is running fine.")
})

cleanupExpiredOtps();