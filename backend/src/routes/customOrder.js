import { Router } from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createCustomOrder,
  getMyCustomOrders,
  quoteCustomOrder,
  respondCustomOrder
} from '../controllers/customizedOrdersController.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Crear solicitud
router.post(
  '/',
  authMiddleware(),
  upload.single('image'),
  createCustomOrder
);

// Ver mis solicitudes
router.get(
  '/me',
  authMiddleware(),
  getMyCustomOrders
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
