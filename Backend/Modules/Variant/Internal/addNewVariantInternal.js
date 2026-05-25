import {
    getProductNameQuery,
    addNewVariantQuery
} from "../Query/addNewVariantQuery.js";

export const getProductNameInternal = async (variantData) => {

    try {

        const { productId } = variantData;

        const productName = await getProductNameQuery({
            productId
        });

        return productName;

    } catch (error) {

        console.log("getProductNameInternal Error:", error);
        throw error;
    }
};

export const addNewVariantInternal = async (variantData) => {

    try {

        const {
            productId,
            color,
            images,
            sizes,
            discountPrice,
            slug
        } = variantData;

        const newVariant = await addNewVariantQuery({
            productId,
            color,
            images,
            sizes,
            discountPrice,
            slug
        });

        return newVariant;

    } catch (error) {

        console.log("addNewVariantInternal Error:", error);
        throw error;
    }
};