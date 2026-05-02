import { findAllUsersQuery } from "../Query/adminUserQuery.js";

export const adminGetUsersService = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const { users, total } = await findAllUsersQuery({ skip, limit });

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};