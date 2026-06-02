import { addNewVariantService } from "../Service/addNewVariantService.js";

export const addNewVariant = async (req, res) => {
    try {
        const {
            productId,
            colorName,
            colorHex,
            discountPrice,
            description,
            stylingTips,
            fabricCare,
            returnExchange,
            isBestSeller,
            isNewArrival
        } = req.body;
        // Safe JSON parse
        let sizes = [];

        try {
            sizes = JSON.parse(req.body.sizes);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid sizes format"
            });
        }

        // Cloudinary uploaded files
        const images = req.files?.map((file) => ({
            url: file.path,
            public_id: file.filename
        }));

        // Validations
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product Id is required."
            });
        }

        if (!colorName) {
            return res.status(400).json({
                success: false,
                message: "Color name is required."
            });
        }

        if (!images || images.length === 0 || images.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Please upload 1 to 5 images."
            });
        }

        if (!sizes || sizes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one size required"
            });
        }

        const newVariant = await addNewVariantService({
            productId,
            colorName,
            colorHex,
            images,
            sizes,
            discountPrice,
            description,
            stylingTips,
            fabricCare,
            returnExchange,
            isBestSeller,
            isNewArrival
        });

        return res.status(201).json({
            success: true,
            message: "New Product Variant Added.",
            data: newVariant
        });

    } catch (error) {

        console.error("addNewVariant Error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};