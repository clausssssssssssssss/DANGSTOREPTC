// src/routes/passwordRecoveryRoutes.js
import { Router } from "express";
import passwordRecoveryController from "../controllers/passwordRecoveryController.js";

/**
 * Rutas para recuperación de contraseña:
 * - POST /send-code   : Genera y envía un código de recuperación de 4 dígitos al email del cliente.
 * - POST /verify-code : Verifica que el código enviado coincida y no esté expirado.
 * - POST /reset       : Restablece la contraseña usando el código válido.
 *
 * Base path sugerido: /api/password-recovery
 */
const router = Router();

/**
 * POST /send-code
 * Genera y envía un código de recuperación con expiración de 15 minutos.
 */
router.post("/send-code", passwordRecoveryController.sendCode);

/**
 * POST /verify-code
 * Comprueba que el código recibido sea correcto y aún válido.
 */
router.post("/verify-code", passwordRecoveryController.verifyCode);

/**
 * POST /reset
 * Valida el código y actualiza la contraseña del cliente.
 */
router.post("/reset", passwordRecoveryController.resetPassword);

export default router;
