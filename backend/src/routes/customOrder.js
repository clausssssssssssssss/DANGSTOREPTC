import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js'; // Importa el middleware de multer
import {
  createCustomOrder,
  getMyCustomOrders,
  getAllPendingOrders,
  getAllOrders,
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

// Ver todas las órdenes pendientes (admin) - DEBE ESTAR ANTES QUE /:id
router.get(
  '/pending',
  authMiddleware(['admin']),
  getAllPendingOrders
);

// Ver todas las órdenes (admin) - para filtros
router.get(
  '/all',
  authMiddleware(['admin']),
  getAllOrders
);

// Obtener una solicitud personalizada por ID - DEBE ESTAR DESPUÉS
router.get(
  '/:id',
  authMiddleware(),
  getCustomOrderById
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
