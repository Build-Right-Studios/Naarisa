import { customAlphabet } from "nanoid";

const idGenerator = customAlphabet("2346789ABCDEFGHJKLMNPQRTUVWXYZ", 9);

export const generateOrderId = () => {
  return `ORD_${idGenerator()}`;  // ✅ Calls the function
};