import express from "express";
import { addProduct } from "./Controller/productController.js";
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

router.post("/add", isAdmin, addProduct);

export default router;