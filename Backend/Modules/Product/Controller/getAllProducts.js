import { getAllProductsService } from "../Service/getAllProductsService.js"

export const getAllProducts = async (req, res) => {
    try {
        const { category, color, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
        const data = await getAllProductsService({ 
            category, color, minPrice, maxPrice, sort, page: Number(page), limit: Number(limit)
        })
        return res.status(200).json({
            success: true,
            message: "All Products fetched.",
            data
        })
    } catch (error) {
        console.log("Error in getAllProducts : ", error);
        return res.status(error.status || 500).json({
            success: false,
            message: "Failed to get Products."
        })
    }
} 