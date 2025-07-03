// src/routes/orderRoutes.js
import { Router } from 'express';
import { checkout, getOrderHistory } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

/**
 * Rutas para procesamiento de órdenes:
 * - POST /checkout : Crea una nueva orden basada en el carrito del usuario.
 * - GET  /history  : Obtiene el historial de órdenes del usuario.
 *
 * Requieren autenticación previa (authMiddleware).
 * Base path sugerido: /api/orders
 */
const router = Router();

/**
 * POST /checkout
 * Middleware: authMiddleware
 * Controlador: checkout
 */
router.post('/checkout', authMiddleware, checkout);

/**
 * GET /history
 * Middleware: authMiddleware
 * Controlador: getOrderHistory
 */
router.get('/history', authMiddleware, getOrderHistory);

export default router;
