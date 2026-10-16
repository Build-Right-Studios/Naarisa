import {
  findLiveAnnouncementsQuery,
  findAllAnnouncementsQuery,
  findAnnouncementByIdQuery,
  createAnnouncementQuery,
  deleteAnnouncementQuery,
} from "../Query/announcementQuery.js";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
// Site paths or https links only — never javascript: or other schemes
const SAFE_LINK = /^(\/[^\s]*|https:\/\/[^\s]+)$/;

const cleanText = (value, field, max, { required = false } = {}) => {
  const text = String(value ?? "").trim();
  if (required && !text) throw { status: 400, message: `${field} is required` };
  if (text.length > max) throw { status: 400, message: `${field} must be at most ${max} characters` };
  return text;
};

const parseDate = (value, field) => {
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw { status: 400, message: `${field} is not a valid date` };
  return date;
};

// Validates the fields present in `body`; on create, missing fields fall back to schema defaults
const buildFields = (body, { creating }) => {
  const fields = {};

  if (creating || body.message !== undefined) fields.message = cleanText(body.message, "Message", 160, { required: true });
  if (body.linkText !== undefined) fields.linkText = cleanText(body.linkText, "Button text", 30);
  if (body.link !== undefined) {
    const link = String(body.link ?? "").trim();
    if (link && !SAFE_LINK.test(link)) throw { status: 400, message: "Link must be a site path like /categories/suits or an https:// URL" };
    fields.link = link;
  }
  for (const key of ["backgroundColor", "textColor"]) {
    if (body[key] === undefined) continue;
    if (!HEX_COLOR.test(body[key])) throw { status: 400, message: "Colours must be hex values like #2B2112" };
    fields[key] = body[key];
  }
  if (body.startsAt !== undefined) fields.startsAt = parseDate(body.startsAt, "Start date");
  if (body.endsAt !== undefined) fields.endsAt = parseDate(body.endsAt, "End date");
  if (body.order !== undefined) {
    const order = Number(body.order);
    if (Number.isNaN(order)) throw { status: 400, message: "Order must be a number" };
    fields.order = order;
  }
  if (body.isActive !== undefined) fields.isActive = Boolean(body.isActive);

  return fields;
};

const assertScheduleOrder = ({ startsAt, endsAt }) => {
  if (startsAt && endsAt && endsAt <= startsAt) throw { status: 400, message: "End date must be after the start date" };
};

export const getLiveAnnouncementsService = () => findLiveAnnouncementsQuery();

export const getAllAnnouncementsService = () => findAllAnnouncementsQuery();

export const createAnnouncementService = async (body) => {
  const fields = buildFields(body, { creating: true });
  assertScheduleOrder(fields);
  return createAnnouncementQuery(fields);
};

export const updateAnnouncementService = async (id, body) => {
  const announcement = await findAnnouncementByIdQuery(id);
  if (!announcement) throw { status: 404, message: "Event bar not found" };

  announcement.set(buildFields(body, { creating: false }));
  assertScheduleOrder(announcement);
  await announcement.save();
  return announcement;
};

export const deleteAnnouncementService = async (id) => {
  const { deletedCount } = await deleteAnnouncementQuery(id);
  if (!deletedCount) throw { status: 404, message: "Event bar not found" };
};
