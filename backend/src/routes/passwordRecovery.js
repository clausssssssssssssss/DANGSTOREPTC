// src/routes/passwordRecovery.js
import { Router } from "express";
import { sendCode, resetPassword } from "../controllers/passwordRecoveryController.js";

const router = Router();

router.post("/send-code", sendCode);
router.post("/reset",      resetPassword);

export default router;
