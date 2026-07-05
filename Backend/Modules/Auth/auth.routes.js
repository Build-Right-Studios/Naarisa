import express from "express";
import { signup } from "./Controller/signupController.js";
import { login } from "./Controller/loginController.js";
import { sendOtp } from "./Controller/sendOtp.js";
import { verifyOtp } from "./Controller/verifyOtp.js";
import { isAdmin } from "../../Middleware/isAdmin.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get("/verify", isAdmin, (req, res) => {
  res.json({ success: true });
});

export default router;