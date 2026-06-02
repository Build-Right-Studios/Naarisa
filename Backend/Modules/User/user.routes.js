import express from "express";

import { getAdmin } from "./Controller/getAdmin.js";

import { getProfile } from "./Controller/getProfile.js";
import { updateProfile } from "./Controller/updateProfile.js";

import { getAddresses } from "./Controller/getAddresses.js";
import { addAddress } from "./Controller/addAddress.js";
import { updateAddress } from "./Controller/updateAddress.js";
import { deleteAddress } from "./Controller/deleteAddress.js";
import { setDefaultAddress } from "./Controller/setDefaultAddress.js";
import { exportUsers } from "./Controller/exportUsers.js";

import { getOrders } from "./Controller/getOrders.js";
import { getOrderById } from "./Controller/getOrderById.js";

import { addToWishlist } from "./Controller/addToWishlist.js";
import { getWishlist } from "./Controller/getWishlist.js";
import { removeFromWishlist } from "./Controller/removeFromWishlist.js";

import { adminGetUsers } from "./Controller/adminGetUsers.js";
import { adminGetUserById } from "./Controller/adminGetUserById.js";

import { isAdmin } from "../../Middleware/isAdmin.js"
import { isUser } from "../../Middleware/isUser.js";

const router = express.Router();

router.get("/get-admin", isAdmin, getAdmin);

router.get("/profile", isUser, getProfile);
router.put("/profile", isUser, updateProfile);

router.get("/addresses", isUser, getAddresses);
router.post("/addresses", isUser, addAddress);
router.put("/addresses/:id", isUser, updateAddress);
router.delete("/addresses/:id", isUser, deleteAddress);
router.put("/addresses/:id/set-default", isUser, setDefaultAddress);

// router.get("/wishlist", isUser, (req, res) => {
//   res.json({
//     success: true,
//     data: [],
//   });
// });

// router.delete("/wishlist/:id", isUser, (req, res) => {
//   res.json({
//     success: true,
//   });
// });

router.get("/orders", isUser, getOrders);
router.get("/orders/:id", isUser, getOrderById);

router.post("/wishlist", isUser, addToWishlist);
router.get("/wishlist", isUser, getWishlist);
router.delete("/wishlist/:id", isUser, removeFromWishlist);

router.get("/", isAdmin, adminGetUsers);
router.get("/export-users", isAdmin, exportUsers);
router.get("/:id", isAdmin, adminGetUserById);


export default router;