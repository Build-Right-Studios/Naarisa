import { getVariantBySlugQuery, getProductByIdQuery, getVariantsByProductQuery } from "../Query/getProductBySlugQuery.js"

export const getVariantBySlugInternal = async (data) => {
    const { slug } = data;
    const variant = await getVariantBySlugQuery({ slug });
    return variant;
};

export const getProductByIdInternal = async (data) => {
    const { id } = data;
    const product = await getProductByIdQuery({ id });
    return product;
};

export const getVariantsByProductInternal = async (data) => {
    const { id } = data;
    const variants = await getVariantsByProductQuery({ id });
    return variants;
};