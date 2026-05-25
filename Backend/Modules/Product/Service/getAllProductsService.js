import { getAllProductsInternal } from "../Internal/getAllProductsInternal.js"

export const getAllProductsService = async (data) => {
    try {
        const { category, color, minPrice, maxPrice, sort, page, limit } = data;

        const skip = (page - 1) * limit;

        // 🔥 Build Filter
        let filter = { isActive: true };

        if (color) {
            filter["color.name"] = color.toLowerCase();
        }

        if (minPrice || maxPrice) {
            filter.discountPrice = {};
            if (minPrice) filter.discountPrice.$gte = Number(minPrice);
            if (maxPrice) filter.discountPrice.$lte = Number(maxPrice);
        }

        // 🔥 Sort Logic
        let sortOption = {};

        switch (sort) {
            case "price_asc":
                sortOption.discountPrice = 1;
                break;
            case "price_desc":
                sortOption.discountPrice = -1;
                break;
            case "discount":
                sortOption.discountPrice = 1;
                break;
            default:
                sortOption.createdAt = -1;
        }


        // 🔥 Fetch Data
        const { variants, total } = await getAllProductsInternal({
            filter,
            skip,
            limit,
            sortOption
        });

        // 🔥 Category Filter (Post-process for now)
        let filteredVariants = variants;

        if (category) {
            filteredVariants = variants.filter(
                v => v.productId.category === category
            );
        }

        // 🔥 Response Mapping
        const products = filteredVariants.map(v => ({
            id: v._id,
            name: v.productId.name,
            category: v.productId.category,
            slug: v.slug,
            color: v.color,
            image: v.images[0]?.url || null,
            price: v.discountPrice
        }));

        return {
            products,
            pagination: {
                total,
                page,
                limit
            }
        };
    } catch (error) {
        console.log("getAllProductsService Error:", error);
        throw error;
    }
}