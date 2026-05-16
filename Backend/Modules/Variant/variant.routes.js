import express from "express";
import multer from "multer";
import { addNewVariant } from "./Controller/addNewVariant.js";
import { updateVariant } from "./Controller/updateVariant.js";
import { deactivateVariant } from "./Controller/deactivateVariant.js";
import { getVariant } from "./Controller/getVariant.js";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { uploadVariantImages } from "../../config/cloudinary.js";

const router = express.Router();

const upload = multer();

router.post("/add-new-variant", uploadVariantImages, isAdmin, addNewVariant);
// router.patch("/:id", isAdmin, updateVariant);
router.patch("/:id", upload.any(), updateVariant);
// router.patch("/:id/deactivate", isAdmin, deactivateVariant);
router.patch("/:id/deactivate", deactivateVariant);

router.get("/:id", isAdmin, getVariant);

export default router;