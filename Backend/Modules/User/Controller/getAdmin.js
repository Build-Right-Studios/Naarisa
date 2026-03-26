import { getAdminService } from "../Service/getAdminService.js";

export const getAdmin = async (req, res) => {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Admin Id is required.",
            });
        }

        const adminProfile = await getAdminService({ id });

        // const safeData = {
        //     _id: adminProfile._id,
        //     name: adminProfile.name,
        //     email: adminProfile.email,
        //     role: adminProfile.role
        // };

        if (!adminProfile) {
            return res.status(404).json({
                success: false,
                message: "Admin Not Found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Admin fetched.",
            data: adminProfile
            // data: safeData
        })

    } catch (error) {
        console.error("getAdmin Error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });

    }
}