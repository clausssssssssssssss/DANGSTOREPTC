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
    console.log(' Controller: Obteniendo conteo de no leídas...');
    const count = await NotificationService.getUnreadCount();
    console.log(' Controller: Conteo obtenido:', count);
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error(' Error obteniendo conteo no leídas:', error);
    console.error(' Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Crear notificación de prueba (TEMPORAL PARA DEBUG)
 */
export const createTestNotification = async (req, res) => {
  try {
    const testNotification = await NotificationService.createRatingNotification({
      productId: 'test-product-id',
      customerName: 'Cliente de Prueba',
      rating: 5,
      productName: 'Producto de Prueba',
      comment: 'Esta es una notificación de prueba'
    });
    
    res.status(201).json({
      success: true,
      message: 'Notificación de prueba creada',
      data: testNotification
    });

  } catch (error) {
    console.error('Error creando notificación de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crear notificación de prueba de stock bajo
 */
export const createTestLowStockNotification = async (req, res) => {
  try {
    const testNotification = await NotificationService.createLowStockNotification({
      productId: 'test-product-id',
      productName: 'Producto de Prueba',
      available: 2
    });
    
    res.status(201).json({
      success: true,
      message: 'Notificación de stock bajo de prueba creada',
      data: testNotification
    });

  } catch (error) {
    console.error('Error creando notificación de stock bajo de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crear notificación de prueba de límite de pedidos
 */
export const createTestOrderLimitNotification = async (req, res) => {
  try {
    const testNotification = await NotificationService.createOrderLimitReachedNotification({
      orderId: 'test-order-id',
      customerName: 'Cliente de Prueba',
      limit: 10,
      currentCount: 8,
      modelType: 'Prueba'
    });
    
    res.status(201).json({
      success: true,
      message: 'Notificación de límite de pedidos de prueba creada',
      data: testNotification
    });

  } catch (error) {
    console.error('Error creando notificación de límite de pedidos de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};