import { Product, Variant } from "../../../MongoDB/models.js";

export const getProductNameQuery = async (variantData) => {

    try {

        const { productId } = variantData;

        const product = await Product.findById(productId).select("name");

        if (!product) {
            throw new Error("Product not found");
        }

        console.log("Product:", product.name);

        return product.name;

    } catch (error) {

        console.log("getProductNameQuery Error:", error);
        throw error;
    }
};

export const addNewVariantQuery = async (variantData) => {

    try {

        const {
            productId,
            color,
            images,
            sizes,
            discountPrice,
            slug
        } = variantData;

        // Sizes formatting
        const formattedSizes = sizes.map((item) => ({
            size: item.size,
            quantity: item.stock
        }));

        // IMPORTANT:
        // images already contain:
        // { url, public_id }

        const newVariant = await Variant.create({

            productId,

            color: {
                name: color.name.trim().toLowerCase(),
                hex: color.hex
            },

            images,

            sizes: formattedSizes,

            discountPrice,

            slug
        });

        return newVariant;

    } catch (error) {

        if (error.code === 11000) {
            throw new Error("Variant with this color already exists");
        }

        console.log("addNewVariantQuery Error:", error);

        throw error;
    }
};