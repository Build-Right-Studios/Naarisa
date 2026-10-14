import slugify from "slugify";
import { uploadImagesToImageKit, deleteImagesFromImageKit } from "../../../config/imagekit.js";
import {
  findActiveCategoriesQuery,
  findAllCategoriesQuery,
  findCategoryByIdQuery,
  categoryExistsQuery,
  createCategoryQuery,
  deleteCategoryQuery,
  countProductsByCategoryQuery,
  countProductsInCategoryQuery,
} from "../Query/categoryQuery.js";

const IMAGE_FOLDER = "/naarisa/categories";

// Multipart forms send everything as strings
const toBool = (value, fallback) => (value === undefined ? fallback : value === true || value === "true");
const toNumber = (value, fallback) => (value === undefined || value === "" ? fallback : Number(value));

const cleanText = (value, field, max, { required = false } = {}) => {
  const text = String(value ?? "").trim();
  if (required && !text) throw { status: 400, message: `${field} is required` };
  if (text.length > max) throw { status: 400, message: `${field} must be at most ${max} characters` };
  return text;
};

export const getActiveCategoriesService = () => findActiveCategoriesQuery();

export const getAllCategoriesService = async () => {
  const [categories, counts] = await Promise.all([findAllCategoriesQuery(), countProductsByCategoryQuery()]);
  return categories.map((category) => ({ ...category, productCount: counts[category.name] || 0 }));
};

export const createCategoryService = async (body, file) => {
  const label = cleanText(body.label, "Category name", 40, { required: true });
  const slug = slugify(label, { lower: true, strict: true });
  if (!slug) throw { status: 400, message: "Category name must contain letters or numbers" };

  if (await categoryExistsQuery({ $or: [{ name: label }, { slug }] })) {
    throw { status: 409, message: `A category called "${label}" already exists` };
  }

  const order = toNumber(body.order, 0);
  if (Number.isNaN(order)) throw { status: 400, message: "Order must be a number" };

  const image = file ? (await uploadImagesToImageKit([file], IMAGE_FOLDER))[0] : null;

  return createCategoryQuery({
    name: label, // products are linked by this value; it never changes afterwards
    label,
    slug,
    tagline: cleanText(body.tagline, "Tagline", 120),
    badge: cleanText(body.badge, "Badge", 20).toUpperCase(),
    showOnHome: toBool(body.showOnHome, true),
    order,
    isActive: toBool(body.isActive, true),
    image: image ? { url: image.url, fileId: image.fileId } : { url: "", fileId: "" },
  });
};

export const updateCategoryService = async (id, body, file) => {
  const category = await findCategoryByIdQuery(id);
  if (!category) throw { status: 404, message: "Category not found" };

  // `name` and `slug` stay fixed so existing products and shared links keep working
  if (body.label !== undefined) category.label = cleanText(body.label, "Category name", 40, { required: true });
  if (body.tagline !== undefined) category.tagline = cleanText(body.tagline, "Tagline", 120);
  if (body.badge !== undefined) category.badge = cleanText(body.badge, "Badge", 20).toUpperCase();
  category.showOnHome = toBool(body.showOnHome, category.showOnHome);
  category.isActive = toBool(body.isActive, category.isActive);

  const order = toNumber(body.order, category.order);
  if (Number.isNaN(order)) throw { status: 400, message: "Order must be a number" };
  category.order = order;

  const oldImage = category.image?.fileId ? { fileId: category.image.fileId } : null;
  if (file) {
    const [image] = await uploadImagesToImageKit([file], IMAGE_FOLDER);
    category.image = { url: image.url, fileId: image.fileId };
  } else if (toBool(body.removeImage, false)) {
    category.image = { url: "", fileId: "" };
  }

  await category.save();

  const imageReplaced = oldImage && category.image?.fileId !== oldImage.fileId;
  if (imageReplaced) await deleteImagesFromImageKit([oldImage]);

  return category;
};

export const deleteCategoryService = async (id) => {
  const category = await findCategoryByIdQuery(id);
  if (!category) throw { status: 404, message: "Category not found" };

  const productCount = await countProductsInCategoryQuery(category.name);
  if (productCount > 0) {
    throw {
      status: 409,
      message: `${productCount} product${productCount === 1 ? " is" : "s are"} in this category. Hide it instead, or move those products first.`,
    };
  }

  await deleteCategoryQuery(id);
  if (category.image?.fileId) await deleteImagesFromImageKit([{ fileId: category.image.fileId }]);
};
