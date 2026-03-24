import express from "express";
import routes from "./routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./config/mongodb.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

await connectMongoDB();

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});