import { Admin } from "../../../MongoDB/models.js";

export const getAdminQuery = async (userData) => {
    try {
        const { id } = userData;
        console.log("ID:", id);
        const admin = await Admin.findById(id).select("-password");
        return admin;
    } catch (error) {
        console.error("getAdminQuery Error:", error);
        throw error;
    }
}