import { uploadBannerService } from "../Service/uploadBannerService.js";

export const uploadBanner = async (req, res) => {
    try {
        const { title, link, order } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        // Multer + Cloudinary puts URLs here
        const desktopImage = req.files?.desktopImage?.[0]?.path;
        const mobileImage = req.files?.mobileImage?.[0]?.path;

        if (!desktopImage || !mobileImage) {
            throw { status: 400, message: "Both desktop and mobile images are required" };
        }

        console.log(desktopImage);
        console.log(mobileImage);

        const cleanLink = link ? link.replace(/^"|"$/g, '') : null;

        const banner = await uploadBannerService({
            title,
            desktopImage,
            mobileImage,
            cleanLink,
            order: Number(order)
        });

        return res.status(201).json({
            success: true,
            message: "Banner uploaded successfully",
            data: banner
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("uploadBanner error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};