import express from "express";
import { isAdmin } from "../../Middleware/isAdmin.js";
import {
  getLiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./Controller/announcementController.js";

const router = express.Router();

router.get("/", getLiveAnnouncements);
router.get("/all", isAdmin, getAllAnnouncements);
router.post("/", isAdmin, createAnnouncement);
router.patch("/:id", isAdmin, updateAnnouncement);
router.delete("/:id", isAdmin, deleteAnnouncement);

export default router;
