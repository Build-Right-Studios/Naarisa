import express from "express";
import { addNewVariant } from "./Controller/addNewVariant.js";
import { updateVariant } from "./Controller/updateVariant.js";
import { deactivateVariant } from "./Controller/deactivateVariant.js"
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

router.post("/add-new-variant", isAdmin, addNewVariant);
// router.patch("/:id", isAdmin, updateVariant);
router.patch("/:id", updateVariant);
// router.patch("/:id/deactivate", isAdmin, deactivateVariant);
router.patch("/:id/deactivate", deactivateVariant);

export default router;