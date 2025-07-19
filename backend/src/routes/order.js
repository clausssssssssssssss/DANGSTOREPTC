import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import ordersController from "../controllers/orderController.js";

const router = Router();

// Crear order en tu BD (tras captura en frontend/api)
router.post("/",     authMiddleware(), ordersController.createOrder);

// Obtener historial
router.get("/",      authMiddleware(), ordersController.getOrders);

export default router;
