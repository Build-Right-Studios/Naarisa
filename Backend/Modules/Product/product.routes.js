import express from "express";
import { addProduct } from "./Controller/productController.js";
import { getParentProducts } from "./Controller/getParentProducts.js";
import { getProducts } from "./Controller/getProducts.js";
import { getProductBySlug } from "./Controller/getProductBySlug.js";
import { getAllProducts } from "./Controller/getAllProducts.js";
import { getNewArrivals } from "./Controller/getNewArrivals.js";
import { getBestSellers } from "./Controller/getBestSellers.js";
import { getCategoryProducts } from "./Controller/getCategoryProducts.js";
import { searchProducts } from "./Controller/searchProducts.js";
import { addReview } from "./Controller/addReview.js";
import { getReviews } from "./Controller/getReviews.js";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { isUser } from "../../Middleware/isUser.js";
import { uploadReviewImages } from "../../config/multer.js";

const router = express.Router();

router.post("/add-product", isAdmin, addProduct);
router.get("/parent-products", isAdmin, getParentProducts);
router.get("/get-products", isAdmin, getProducts); 
router.get("/products", getAllProducts); 
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/category/:category", getCategoryProducts);
router.get("/search", searchProducts);
router.post("/:variantId/reviews", isUser, uploadReviewImages, addReview);
router.get("/:variantId/reviews", getReviews);
router.get("/:slug", getProductBySlug);

export default router;