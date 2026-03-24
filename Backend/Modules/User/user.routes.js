import express from "express";
import { isAdmin } from "../../Middleware/isAdmin.js"

const router = express.Router();

router.get("/get-admin", isAdmin, getAdmin);

export default router;