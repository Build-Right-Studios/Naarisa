import { Announcement } from "../../../MongoDB/models.js";

const PUBLIC_FIELDS = "message linkText link backgroundColor textColor updatedAt";

// Active and inside its schedule (a missing start/end date means "no limit")
export const findLiveAnnouncementsQuery = (now = new Date()) =>
  Announcement.find({
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .select(PUBLIC_FIELDS)
    .sort({ order: 1, createdAt: -1 })
    .lean();

export const findAllAnnouncementsQuery = () => Announcement.find().sort({ order: 1, createdAt: -1 }).lean();

export const findAnnouncementByIdQuery = (id) => Announcement.findById(id);

export const createAnnouncementQuery = (data) => Announcement.create(data);

export const deleteAnnouncementQuery = (id) => Announcement.deleteOne({ _id: id });
