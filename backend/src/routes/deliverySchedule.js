import express from 'express';
import * as deliveryScheduleController from '../controllers/deliveryScheduleController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas para admin
router.post('/:orderId/schedule', verifyToken, verifyAdmin, deliveryScheduleController.scheduleDelivery);
router.put('/:orderId/rescheduling', verifyToken, verifyAdmin, deliveryScheduleController.handleRescheduling);
router.put('/:orderId/status', verifyToken, verifyAdmin, deliveryScheduleController.updateDeliveryStatus);
router.post('/:orderId/start-making', verifyToken, verifyAdmin, deliveryScheduleController.startMakingOrder);
router.get('/orders', verifyToken, verifyAdmin, deliveryScheduleController.getOrdersByDeliveryStatus);
router.get('/rescheduling-requests', verifyToken, verifyAdmin, deliveryScheduleController.getPendingReschedulingRequests);

// Rutas para eliminar órdenes (solo admin)
router.delete('/orders/:orderId', verifyToken, verifyAdmin, deliveryScheduleController.deleteOrder);
router.delete('/orders', verifyToken, verifyAdmin, deliveryScheduleController.deleteAllOrders);

// Rutas para clientes
router.post('/:orderId/confirm', verifyToken, deliveryScheduleController.confirmDelivery);
router.post('/:orderId/request-reschedule', verifyToken, deliveryScheduleController.requestRescheduling);

export default router;

