import express from 'express';
import { acceptDelivery, rejectDelivery, getUserOrders, deleteAllOrders } from '../controllers/orderController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.get('/', verifyToken, getUserOrders);
router.post('/:orderId/accept-delivery', verifyToken, acceptDelivery);
router.post('/:orderId/reject-delivery', verifyToken, rejectDelivery);

// Rutas para eliminar órdenes (solo admin)
router.delete('/all', verifyToken, verifyAdmin, deleteAllOrders);
router.delete('/:orderId', verifyToken, verifyAdmin, deleteOrder);

export default router;

