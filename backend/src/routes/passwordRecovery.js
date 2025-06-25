import { Router } from "express";
import passwordRecoveryController from "../controllers/passwordRecoveryController.js";

const router = Router();

router.post("/send-code",    passwordRecoveryController.sendCode);
router.post("/verify-code",  passwordRecoveryController.verifyCode);
router.post("/reset",        passwordRecoveryController.resetPassword);

export default router;
