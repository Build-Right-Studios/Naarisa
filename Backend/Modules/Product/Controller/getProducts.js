import { Product } from "../../../MongoDB/models.js"

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            message: "All products.",
            data: products
        })
    } catch (error) {
        console.log("Error in products.")
    }
}