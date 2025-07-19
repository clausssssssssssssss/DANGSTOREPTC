import { Router } from "express";
import paymentController from "../controllers/paymentController.js";
import fakePaymentController from "../controllers/fakePaymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Crear orden en PayPal
router.post("/create", authMiddleware(), paymentController.createPayment);

// Capturar pago en PayPal
router.post("/capture", authMiddleware(), paymentController.capturePayment);


router.post("/fake",    authMiddleware(), fakePaymentController.fakeCheckout);


export default router;
