import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js'; // Importa el middleware de multer
import {
  createCustomOrder,
  getMyCustomOrders,
  getAllPendingOrders,
  quoteCustomOrder,
  respondCustomOrder,
  getCustomOrderById 
} from '../controllers/customizedOrdersController.js';

const router = Router();

// Crear solicitud con imagen (usando el middleware de multer)
router.post(
  '/',
  authMiddleware(),
  upload.single('image'),  // Procesa la imagen enviada como 'image' en el body
  createCustomOrder
);

// Ver mis solicitudes
router.get(
  '/me',
  authMiddleware(),
  getMyCustomOrders
);

// Obtener una solicitud personalizada por ID
router.get(
  '/:id',
  authMiddleware(),
  getCustomOrderById
);

// Ver todas las órdenes pendientes (admin)
router.get(
  '/pending',
  authMiddleware(['admin']),
  getAllPendingOrders
);

// Cotizar (admin)
router.put(
  '/:id/quote',
  authMiddleware(['admin']),
  quoteCustomOrder
);

// Aceptar / rechazar (usuario)
router.put(
  '/:id/respond',
  authMiddleware(),
  respondCustomOrder
);

export default router;
