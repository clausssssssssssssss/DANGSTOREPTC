import { Router } from "express";
import paymentController from "../controllers/paymentController.js";
import fakePaymentController from "../controllers/fakePaymentController.js";
import validateAuthToken from "../middleware/validateAuthToken.js";

const router = Router();

// Crear orden en PayPal
router.post("/create", validateAuthToken(), paymentController.createPayment);

// Capturar pago en PayPal
router.post("/capture", validateAuthToken(), paymentController.capturePayment);


router.post("/fake",    validateAuthToken(), fakePaymentController.fakeCheckout);


export default router;
