import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener notificaciones del usuario
router.get('/', getUserNotifications);

// Obtener estadísticas de notificaciones
router.get('/stats', getNotificationStats);

// Marcar notificación como leída
router.put('/:id/read', markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/read-all', markAllAsRead);

// Eliminar notificación
router.delete('/:id', deleteNotification);

// Eliminar todas las notificaciones
router.delete('/', deleteAllNotifications);

export default router;