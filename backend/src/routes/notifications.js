import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createTestNotification,
  createTestLowStockNotification,
  createTestOrderLimitNotification
} from '../controllers/notificationsController.js';

const router = Router();

// Obtener todas las notificaciones
router.get(
  '/',
  authMiddleware(['admin']), // Solo admins pueden ver notificaciones
  getAllNotifications
);

// Obtener conteo de no leídas
router.get(
  '/unread-count',
  authMiddleware(['admin']),
  getUnreadCount
);

// Marcar notificación como leída
router.put(
  '/:id/read',
  authMiddleware(['admin']),
  markNotificationAsRead
);

// Marcar todas como leídas
router.put(
  '/read-all',
  authMiddleware(['admin']),
  markAllNotificationsAsRead
);

// Eliminar notificación específica
router.delete(
  '/:id',
  authMiddleware(['admin']),
  deleteNotification
);

// Eliminar todas las notificaciones
router.delete(
  '/',
  authMiddleware(['admin']),
  deleteAllNotifications
);

// Crear notificación de prueba (TEMPORAL PARA DEBUG)
router.post(
  '/test',
  authMiddleware(['admin']),
  createTestNotification
);

// Crear notificación de prueba de stock bajo
router.post(
  '/test/low-stock',
  authMiddleware(['admin']),
  createTestLowStockNotification
);

// Crear notificación de prueba de límite de pedidos
router.post(
  '/test/order-limit',
  authMiddleware(['admin']),
  createTestOrderLimitNotification
);

export default router;