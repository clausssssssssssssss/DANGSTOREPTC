import { Router } from 'express';
import multer from 'multer';
import validateAuthToken from '../middleware/validateAuthToken.js';
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
  validateAuthToken(),
  upload.single('uploads'),
  createCustomOrder
);

// Ver mis solicitudes
router.get(
  '/me',
  validateAuthToken(),
  getMyCustomOrders
);

// Cotizar (admin)
router.put(
  '/:id/quote',
  validateAuthToken(['admin']),
  quoteCustomOrder
);

// Aceptar / rechazar (usuario)
router.put(
  '/:id/respond',
  validateAuthToken(),
  respondCustomOrder
);

export default router;
