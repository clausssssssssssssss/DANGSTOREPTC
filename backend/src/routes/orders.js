import express from 'express';
import { acceptDelivery, rejectDelivery, getUserOrders } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.get('/', verifyToken, getUserOrders);
router.post('/:orderId/accept-delivery', verifyToken, acceptDelivery);
router.post('/:orderId/reject-delivery', verifyToken, rejectDelivery);

export default router;
