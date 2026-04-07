import express from "express";
import { addNewVariant } from "./Controller/addNewVariant.js";
import { updateVariant } from "./Controller/updateVariant.js";
import { isAdmin } from "../../Middleware/isAdmin.js";
import { findProductInternal } from "../Product/Internal/findProduct.js";

const router = express.Router();

router.post("/add-new-variant", isAdmin, addNewVariant);
// router.patch("/:id", isAdmin, updateVariant);
router.patch("/:id", updateVariant);
// router.patch("/:id/deactivate", isAdmin, deactivateVariant);
router.patch("/:id/deactivate", deactivateVariant);

export default router;