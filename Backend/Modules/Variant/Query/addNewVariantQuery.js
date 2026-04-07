import { Product } from "../../../MongoDB/models.js";
import { Variant } from "../../../MongoDB/models.js";

export const getProductNameQuery = async (variantData) => {
    try {
        const { productId } = variantData;
        const productName = await Product.findById(productId).select("name");
        console.log("Product :", productName);
        console.log("Product :", productName.name);
        if (!productName) {
            throw new Error("Product not found");
        }
        return productName.name;
    } catch (error) {
        console.log("getProductNameQuery Error:", error);
        throw error;
    }
}

export const addNewVariantQuery = async (variantData) => {
    try {
        const { productId, color, images, sizes, discountPrice, slug } = variantData;
        const newVariant = await Variant.create({
            productId,
            color: {
                name: color.name.trim().toLowerCase(),
                hex: color.hex
            },
            images, sizes, discountPrice, slug
        });
        return newVariant;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Variant with this color already exists");
        }
        console.log("addNewVariantQuery Error:", error);
        throw error;
    }
}