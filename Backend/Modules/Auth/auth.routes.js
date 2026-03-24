import express from "express";
import { signup } from "./Controller/signupController.js";
import { login } from "./Controller/loginController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;