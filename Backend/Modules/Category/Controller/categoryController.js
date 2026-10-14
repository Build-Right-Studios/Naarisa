import {
  getActiveCategoriesService,
  getAllCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../Service/categoryService.js";

const handleError = (res, error, label) => {
  if (error.status) return res.status(error.status).json({ success: false, message: error.message });
  if (error.name === "CastError") return res.status(404).json({ success: false, message: "Category not found" });
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

// Public — storefront menu, category pages and home tiles
export const getActiveCategories = async (req, res) => {
  try {
    const categories = await getActiveCategoriesService();
    res.set("Cache-Control", "public, max-age=60");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return handleError(res, error, "getActiveCategories");
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return handleError(res, error, "getAllCategories");
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await createCategoryService(req.body, req.file);
    return res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error) {
    return handleError(res, error, "createCategory");
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await updateCategoryService(req.params.id, req.body, req.file);
    return res.status(200).json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    return handleError(res, error, "updateCategory");
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await deleteCategoryService(req.params.id);
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    return handleError(res, error, "deleteCategory");
  }
};
