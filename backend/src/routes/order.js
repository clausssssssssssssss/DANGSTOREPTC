import { Router } from "express";
import validateAuthToken from "../middleware/validateAuthToken.js";
import ordersController from "../controllers/orderController.js";

const router = Router();

// Crear order en tu BD (tras captura en frontend/api)
router.post("/",     validateAuthToken(), ordersController.createOrder);

// Obtener historial
router.get("/",      validateAuthToken(), ordersController.getOrders);

export default router;
