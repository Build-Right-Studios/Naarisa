import { getAdminInternal } from "../Internal/getAdminInternal";

export const getAdminService = async (userData) => {
    try {
        const {id} = userData;
        const adminProfile = await getAdminInternal({id});

        if(!adminProfile) 
            return null;
    
        return adminProfile;
    } catch (error) {
        console.error("getAdminService Error:", error);
        throw error;
    }
}