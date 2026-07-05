import express from "express";
import { uploadBannerImages } from "../../config/cloudinary.js";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { uploadBanner } from "./Controller/uploadBanner.js";
import { getBanners, getActiveBanners } from "./Controller/getBanners.js";
import { deleteBanner } from "./Controller/deleteBanner.js";

const router = express.Router();

router.post("/upload", isAdmin, uploadBannerImages, uploadBanner);
router.get("/get-banners", isAdmin, getBanners);
router.delete("/:id", isAdmin, deleteBanner);
router.get("/get-active-banners", getActiveBanners);

export default router;