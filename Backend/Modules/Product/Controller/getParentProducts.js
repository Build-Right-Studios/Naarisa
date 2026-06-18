import { Product } from "../../../MongoDB/models.js";

export const getParentProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .select("_id name category")
            .sort({ createdAt: -1 })
            .lean();

        const formattedProducts = products.map((p) => ({
            id: p._id.toString(),
            name: p.name,
        }));

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully.",
            data: formattedProducts,
        });
    } catch (error) {
        console.error("Error fetching products:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products.",
            error: error.message,
        });
    }
};