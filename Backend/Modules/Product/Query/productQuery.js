import { Product } from "../../../MongoDB/models.js";

export const createProductQuery = async (data) => {
  return await Product.create(data);
};

export const findProductQuery = async (name) => {
  return await Product.findOne({
    name: { $regex: `^${name}$`, $options: "i" }
  });
};