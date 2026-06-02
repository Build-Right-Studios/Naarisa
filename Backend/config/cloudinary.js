import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

dotenv.config();

/* -------------------------------------------------------------------------- */
/*                               CLOUDINARY SETUP                             */
/* -------------------------------------------------------------------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* -------------------------------------------------------------------------- */
/*                               BANNER STORAGE                               */
/* -------------------------------------------------------------------------- */

const storage_banners = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    const isDesktop = file.fieldname === "desktopImage";

    return {
      folder: isDesktop
        ? "naarisa/banners/desktop"
        : "naarisa/banners/mobile",

      allowed_formats: ["jpg", "jpeg", "png", "webp"],

    };
  }
});

export const uploadBannerImages = multer({
  storage: storage_banners,

  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 }
]);

/* -------------------------------------------------------------------------- */
/*                              VARIANT STORAGE                               */
/* -------------------------------------------------------------------------- */

const storage_variants = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    return {
      folder: "naarisa/variants",

      allowed_formats: ["jpg", "jpeg", "png", "webp"],

      resource_type: "image"
    };
  }
});

export const uploadVariantImages = multer({
  storage: storage_variants,

  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).array("images", 5);

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export { cloudinary };