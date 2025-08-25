import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
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

export default router;