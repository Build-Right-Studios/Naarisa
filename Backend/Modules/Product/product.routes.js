import express from "express";
import { addProduct } from "./Controller/productController.js";
import { getParentProducts } from "./Controller/getParentProducts.js";
import { getProducts } from "./Controller/getProducts.js";
import { getProductBySlug } from "./Controller/getProductBySlug.js";
import { getAllProducts } from "./Controller/getAllProducts.js";
import { getNewArrivals } from "./Controller/getNewArrivals.js";
import { getBestSellers } from "./Controller/getBestSellers.js";
import { getCategoryProducts } from "./Controller/getCategoryProducts.js";
import { addReview } from "./Controller/addReview.js";
import { getReviews } from "./Controller/getReviews.js";
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

router.post("/add-product", isAdmin, addProduct);
// router.get("/get-products",isAdmin, getProducts);
router.get("/parent-products", getParentProducts);
router.get("/get-products", getProducts);
router.get("/products", getAllProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/category/:category", getCategoryProducts);
router.post("/:variantId/reviews", addReview);
router.get("/:variantId/reviews", getReviews);
router.get("/:slug", getProductBySlug);


// Best Sellers

export default router;