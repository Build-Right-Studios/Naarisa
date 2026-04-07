import express from "express";
import { addProduct } from "./Controller/productController.js";
import { getProducts } from "./Controller/getProducts.js";
import { getProductBySlug } from "./Controller/getProductBySlug.js";
import { getAllProducts } from "./Controller/getAllProducts.js";
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

router.post("/add-product", isAdmin, addProduct);
router.get("/get-products",isAdmin, getProducts);
router.get("/products", getAllProducts);
router.get("/:slug", getProductBySlug);

export default router;