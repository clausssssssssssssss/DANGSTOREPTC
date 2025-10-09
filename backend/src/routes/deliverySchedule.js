import express from 'express';
import * as deliveryScheduleController from '../controllers/deliveryScheduleController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas para admin
router.post('/:orderId/schedule', verifyToken, verifyAdmin, deliveryScheduleController.scheduleDelivery);
router.put('/:orderId/rescheduling', verifyToken, verifyAdmin, deliveryScheduleController.handleRescheduling);
router.put('/:orderId/status', verifyToken, verifyAdmin, deliveryScheduleController.updateDeliveryStatus);
router.get('/orders', verifyToken, verifyAdmin, deliveryScheduleController.getOrdersByDeliveryStatus);
router.get('/rescheduling-requests', verifyToken, verifyAdmin, deliveryScheduleController.getPendingReschedulingRequests);

// Rutas para clientes
router.put('/:orderId/confirm', verifyToken, deliveryScheduleController.confirmDelivery);
router.post('/:orderId/request-rescheduling', verifyToken, deliveryScheduleController.requestRescheduling);

export default router;

