import multer from "multer";

const storage = multer.memoryStorage();

export const uploadVariantImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).array("images", 8);

export const uploadReviewImages = multer({
  storage, // same memoryStorage instance already defined in this file
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("images", 4); // cap at 4 images per review, adjust as needed