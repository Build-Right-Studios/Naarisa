import { getAdminQuery } from "../Query/getAdminQuery.js";

export const getAdminInternal = async (userData) => {
    try {
        const { id } = userData;
        const admin = await getAdminQuery({ id })
        return admin;
    } catch (error) {
        console.error("getAdminInternal Error:", error);
        throw error;
    }
}