import { sendContactMailService } from "../Service/contactService.js";

export const sendContactMail = async (req, res) => {
  try {
    const response = await sendContactMailService(req.body);

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
      data: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to send message.",
    });
  }
};