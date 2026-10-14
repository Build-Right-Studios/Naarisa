import express from "express";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { uploadCategoryImage } from "../../config/multer.js";
import {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./Controller/categoryController.js";

const router = express.Router();

router.get("/", getActiveCategories);
router.get("/all", isAdmin, getAllCategories);
router.post("/", isAdmin, uploadCategoryImage, createCategory);
router.patch("/:id", isAdmin, uploadCategoryImage, updateCategory);
router.delete("/:id", isAdmin, deleteCategory);

export default router;
