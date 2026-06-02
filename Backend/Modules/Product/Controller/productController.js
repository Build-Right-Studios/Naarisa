import { addProductService } from "../Service/productService.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      basePrice,
      tags
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!basePrice && basePrice !== 0) {
      return res.status(400).json({
        success: false,
        message: "Base price is required",
      });
    }

    const result = await addProductService({
      name,
      category: category.trim(),
      basePrice,
      tags
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};