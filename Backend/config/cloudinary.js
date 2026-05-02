import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isDesktop = file.fieldname === "desktopImage";
    return {
      folder: isDesktop
        ? "naarisa/banners/desktop"
        : "naarisa/banners/mobile",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: isDesktop
        ? [{ width: 1440, height: 600, crop: "fill" }]
        : [{ width: 768, height: 900, crop: "fill" }]
    };
  }
});

export const uploadBannerImages = multer({ storage }).fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 }
]);

export { cloudinary };