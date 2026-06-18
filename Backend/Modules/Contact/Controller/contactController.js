// ─── contactController.js ────────────────────────────────────────────────────

import { sendContactEmailService } from "../Service/contactService.js";

/**
 * POST /api/contact
 *
 * Body:
 *   name     {string} required
 *   email    {string} required
 *   phone    {string} optional
 *   subject  {string} required
 *   message  {string} required
 */
export const sendContactEmail = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // ── Validation ──
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required."
            });
        }

        if (!subject?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject is required."
            });
        }

        if (!message?.trim() || message.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must be at least 10 characters."
            });
        }

        await sendContactEmailService({ name, email, phone, subject, message });

        return res.status(200).json({
            success: true,
            message: "Your message has been sent. We'll get back to you within 24 hours."
        });

    } catch (error) {
        console.error("sendContactEmail Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again."
        });
    }
};