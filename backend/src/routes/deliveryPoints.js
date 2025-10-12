import express from 'express';
import * as deliveryPointController from '../controllers/deliveryPointController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (clientes pueden ver puntos activos)
router.get('/', deliveryPointController.getAllDeliveryPoints);
router.get('/:id', deliveryPointController.getDeliveryPointById);

// Rutas protegidas (solo admin) - TEMPORALMENTE SIN AUTENTICACIÓN PARA PRUEBAS
router.post('/', deliveryPointController.createDeliveryPoint);
router.put('/:id', deliveryPointController.updateDeliveryPoint);
router.patch('/:id/toggle', deliveryPointController.toggleDeliveryPointStatus);
router.delete('/:id', deliveryPointController.deleteDeliveryPoint);

export default router;

