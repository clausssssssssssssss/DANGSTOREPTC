import Notification from '../models/Notification.js';
import { getIO } from '../services/socket.js';

// Crear una nueva notificación
export const createNotification = async (userId, type, title, message, orderId = null, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      orderId,
      data,
      read: false
    });

    await notification.save();
    
    // Emitir notificación en tiempo real a través de WebSocket
    const io = getIO();
    if (io) {
      io.to(`user-${userId}`).emit('new_notification', {
        type: 'new_notification',
        notification: {
          _id: notification._id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          orderId: notification.orderId,
          read: notification.read,
          data: notification.data,
          createdAt: notification.createdAt
        }
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Obtener notificaciones del usuario
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'modelType description price status');

    const total = await Notification.countDocuments({ userId });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
  }
};

// Marcar notificación como leída
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error al marcar notificación como leída', error: error.message });
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error al marcar notificaciones como leídas', error: error.message });
  }
};

// Eliminar notificación
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error al eliminar notificación', error: error.message });
  }
};

// Eliminar todas las notificaciones
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ userId });

    res.json({ message: 'Todas las notificaciones eliminadas correctamente' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Error al eliminar notificaciones', error: error.message });
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, read: false });
    const read = await Notification.countDocuments({ userId, read: true });

    res.json({
      total,
      unread,
      read
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};