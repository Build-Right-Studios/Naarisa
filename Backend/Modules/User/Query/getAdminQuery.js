import { Admin } from "../../../MongoDB/models";

export const getAdminQuery = async (userData) => {
    try {
        const { id } = userData;
        const admin = await Admin.findOne({ id });
        return admin;
    } catch (error) {
        console.error("getAdminQuery Error:", error);
        throw error;
    }
}