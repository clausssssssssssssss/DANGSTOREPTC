import { Router } from "express";
import paymentController from "../controllers/paymentController.js";
import validateAuthToken from "../middleware/validateAuthToken.js";

const router = Router();

// Crear orden en PayPal
router.post("/create", validateAuthToken(), paymentController.createPayment);

// Capturar pago en PayPal
router.post("/capture", validateAuthToken(), paymentController.capturePayment);

export default router;
