import { Category, Product } from "../../../MongoDB/models.js";

const PUBLIC_FIELDS = "name label slug tagline image badge showOnHome order";

export const findActiveCategoriesQuery = () =>
  Category.find({ isActive: true }).select(PUBLIC_FIELDS).sort({ order: 1, createdAt: 1 }).lean();

export const findAllCategoriesQuery = () =>
  Category.find().sort({ order: 1, createdAt: 1 }).lean();

export const findCategoryByIdQuery = (id) => Category.findById(id);

export const categoryExistsQuery = (filter) => Category.exists(filter);

export const createCategoryQuery = (data) => Category.create(data);

export const deleteCategoryQuery = (id) => Category.deleteOne({ _id: id });

// { "Short Kurti": 12, ... } — how many products each category name has
export const countProductsByCategoryQuery = async () => {
  const rows = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
};

export const findHiddenCategoryNamesQuery = async () =>
  (await Category.find({ isActive: false }).select("name").lean()).map((c) => c.name);

export const countProductsInCategoryQuery = (name) => Product.countDocuments({ category: name });
