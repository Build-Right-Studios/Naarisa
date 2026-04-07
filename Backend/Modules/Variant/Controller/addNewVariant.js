import { addNewVariantService } from "../Service/addNewVariantService.js";

export const addNewVariant = async (req, res) => {
    try {
        const { productId, color, images, sizes, discountPrice } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product Id is required."
            })
        }

        if (!color) {
            return res.status(400).json({
                success: false,
                message: "Color is required."
            })
        }

        if (!images || images.length === 0 || images.length > 4) {
            return res.status(400).json({
                success: false,
                message: "Error Uploading images."
            })
        }

        if (!sizes || sizes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one size required"
            })
        }

        const newVariant = await addNewVariantService({ productId, color, images, sizes, discountPrice });

        return res.status(201).json({
            success:true,
            message: "New Product Variant Added.",
            data: newVariant
        })
    } catch (error) {
        console.error("getAdmin Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
        })
    }
}