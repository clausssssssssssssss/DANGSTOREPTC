import express from 'express';
import * as deliveryPointController from '../controllers/deliveryPointController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (clientes pueden ver puntos activos)
router.get('/', deliveryPointController.getAllDeliveryPoints);
router.get('/:id', deliveryPointController.getDeliveryPointById);

// Rutas protegidas (solo admin)
router.post('/', verifyToken, verifyAdmin, deliveryPointController.createDeliveryPoint);
router.put('/:id', verifyToken, verifyAdmin, deliveryPointController.updateDeliveryPoint);
router.patch('/:id/toggle', verifyToken, verifyAdmin, deliveryPointController.toggleDeliveryPointStatus);
router.delete('/:id', verifyToken, verifyAdmin, deliveryPointController.deleteDeliveryPoint);

export default router;

