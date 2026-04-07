export const updateVariantInternal = async (data) => {
    try {
        const {id, updates} = data;
        const updateVariant = await updateVariantQuery({ id, updates });
        return updateVariant;
    } catch (error) {
        console.log("updateVariantInternal Error:", error);
        throw error;
    }
}