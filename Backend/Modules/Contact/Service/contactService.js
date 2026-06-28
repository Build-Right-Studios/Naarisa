// Modules/Contact/Service/contactService.js

import { sendContactFormEmail } from "../../../config/emailService.js";

export const sendContactMailService = async (data) => {

  const {
    name,
    email,
    phone,
    subject,
    message,
  } = data;

  if (!name?.trim())
    throw new Error("Name is required.");

  if (!email?.trim())
    throw new Error("Email is required.");

  if (!subject?.trim())
    throw new Error("Subject is required.");

  if (!message?.trim())
    throw new Error("Message is required.");

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email))
    throw new Error("Invalid email address.");

  return await sendContactFormEmail({
    name,
    email,
    phone,
    subject,
    message,
  });
};