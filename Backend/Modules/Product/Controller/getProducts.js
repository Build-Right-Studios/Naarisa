import { Product, Variant } from "../../../MongoDB/models.js"

export const getProducts = async (req, res) => {
    try {
        // Fetch variants and populate the productId field with Product data
        const variants = await Variant.find()
            .populate({
                path: "productId",
                select: "name category basePrice" // Only select name and category from Product
            })
            .lean(); // Use lean() for better performance since we're only reading data

        // Format the response to match the desired structure
        const formattedProducts = variants.map(variant => {
            return {
                id: variant._id.toString(),
                name: variant.productId?.name || "Unnamed Product",
                category: variant.productId?.category || "Uncategorized",
                slug: variant.slug,
                color: {
                    name: variant.color?.name || "",
                    hex: variant.color?.hex || ""
                },
                image: variant.images?.[0]?.url || null,
                price: variant.discountPrice || variant.productId?.basePrice || 0,
                // Optional: Include these if needed in frontend
                isActive: variant.isActive,
                isBestSeller: variant.isBestSeller,
                isNewArrival: variant.isNewArrival,
                // If you need all images instead of just first one:
                // images: variant.images || []
            };
        });
        console.log(formattedProducts)

        res.status(200).json({
            success: true,
            message: "All products.",
            data: formattedProducts
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching products.",
            error: error.message
        });
    }
}