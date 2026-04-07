import { getProductBySlugService } from "../Service/getProductBySlugService.js"

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if(!slug) {
            return res.status(400).json({
                success: false,
                message:"Slug is required"
            })
        }

        const { product, currentVariant, allVariants } = await getProductBySlugService({slug});

        res.status(200).json({
            success: true,
            message: "Found Product.",
            product,
            currentVariant,
            allVariants
        })
    } catch (error) {
        console.log("Error in getProductBySlug : ", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server error."
        })
    }
}