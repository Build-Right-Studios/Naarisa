import {
  getLiveAnnouncementsService,
  getAllAnnouncementsService,
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService,
} from "../Service/announcementService.js";

const handleError = (res, error, label) => {
  if (error.status) return res.status(error.status).json({ success: false, message: error.message });
  if (error.name === "CastError") return res.status(404).json({ success: false, message: "Event bar not found" });
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

// Public — the bar shown above the storefront navbar
export const getLiveAnnouncements = async (req, res) => {
  try {
    const announcements = await getLiveAnnouncementsService();
    // Revalidate every time (cheap 304 via ETag) so admin changes show on the next page load
    res.set("Cache-Control", "no-cache");
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    return handleError(res, error, "getLiveAnnouncements");
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await getAllAnnouncementsService();
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    return handleError(res, error, "getAllAnnouncements");
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await createAnnouncementService(req.body);
    return res.status(201).json({ success: true, message: "Event bar created", data: announcement });
  } catch (error) {
    return handleError(res, error, "createAnnouncement");
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await updateAnnouncementService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Event bar updated", data: announcement });
  } catch (error) {
    return handleError(res, error, "updateAnnouncement");
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    await deleteAnnouncementService(req.params.id);
    return res.status(200).json({ success: true, message: "Event bar deleted" });
  } catch (error) {
    return handleError(res, error, "deleteAnnouncement");
  }
};
