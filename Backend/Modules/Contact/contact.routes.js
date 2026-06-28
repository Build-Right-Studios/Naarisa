import express from "express";
import { sendContactMail } from "./Controller/contactController.js";
 
const router = express.Router();
 
router.post("/contact-mail", sendContactMail);
 
export default router;
 