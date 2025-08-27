import NotificationService from '../services/NotificationService.js';

/**
 * Obtener todas las notificaciones
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const notifications = await NotificationService.getAllNotifications(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Marcar notificación como leída
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await NotificationService.markAsRead(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification
    });

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead();
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notificaciones marcadas como leídas`
    });

  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Eliminar notificación
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await NotificationService.deleteNotification(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Eliminar todas las notificaciones
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await NotificationService.deleteAllNotifications();
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notificaciones eliminadas`
    });

  } catch (error) {
    console.error('Error eliminando todas las notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener conteo de notificaciones no leídas
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount();
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error('Error obteniendo conteo no leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};