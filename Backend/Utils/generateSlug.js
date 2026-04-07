import slugify from "slugify";

const generateSlug = async (slugData) => {
    try {
        const { productName, colorName } = slugData;

        const baseSlug = slugify(`${productName}-${colorName}`, {
            lower: true,
            strict: true
        });

        const uniqueSuffix = Date.now().toString().slice(-5);
        const finalSlug = `${baseSlug}-${uniqueSuffix}`;
        return finalSlug;

    } catch (error) {
        console.log("generateSlug Error:", error);
        throw error;
    }
}

export default generateSlug;