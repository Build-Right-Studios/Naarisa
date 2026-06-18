// ─── contactService.js ───────────────────────────────────────────────────────
// npm install resend
//
// Required env variable:
//   RESEND_API_KEY — from resend.com/api-keys
//
// Until your domain is verified, use: from: "onboarding@resend.dev"
// Once naarisa.com is verified, switch to: from: "contact@naarisa.com"

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmailService = async ({ name, email, phone, subject, message }) => {
    try {
        const response = await resend.emails.send({
            from:    "onboarding@resend.dev",       // ← swap to "contact@naarisa.com" after domain verify
            to:      "aryesh@srivastava.com",            // ← your personal/team inbox
            subject: `[${subject}] Message from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone || "Not provided"}</p>
                <p><b>Subject:</b> ${subject}</p>
                <p><b>Message:</b><br/>${message.replace(/\n/g, "<br/>")}</p>
            `,
        });

        if (!response || response.error) {
            console.error("Resend Error:", response?.error);
            throw new Error("Email service failed");
        }

    } catch (error) {
        console.error("contactService Error:", error);
        throw error;
    }
};