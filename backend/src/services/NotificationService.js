import Notification from '../models/Notifications.js';

class NotificationService {
  
  /**
   * Crear notificación para nueva orden
   */
  static async createOrderNotification(orderData) {
    try {
      const notification = new Notification({
        title: '🎨 Nueva Orden Personalizada',
        message: `${orderData.customerName} ha solicitado un ${orderData.modelType}`,
        type: 'new_order',
        priority: 'high',
        data: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          modelType: orderData.modelType,
          imageUrl: orderData.imageUrl,
        },
        icon: '🆕',
      });

      const savedNotification = await notification.save();
      console.log('✅ Notificación creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para nuevo encargo (sin customerName)
   */
  static async createNewOrderNotification(orderData) {
    try {
      const notification = new Notification({
        title: '🎨 Nuevo Encargo Personalizado',
        message: `Se ha recibido un nuevo encargo de ${orderData.modelType}`,
        type: 'new_order',
        priority: 'high',
        data: {
          orderId: orderData.orderId,
          modelType: orderData.modelType,
          description: orderData.description,
        },
        icon: '🆕',
      });

      const savedNotification = await notification.save();
      console.log('✅ Notificación de nuevo encargo creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('❌ Error creando notificación de nuevo encargo:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para orden cotizada
   */
  static async createQuoteNotification(orderData) {
    try {
      const notification = new Notification({
        title: '💰 Orden Cotizada',
        message: `Se cotizó la orden de ${orderData.customerName} por $${orderData.price}`,
        type: 'order_updated',
        priority: 'normal',
        data: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          price: orderData.price,
          modelType: orderData.modelType,
        },
        icon: '💲',
      });

      return await notification.save();
    } catch (error) {
      console.error('❌ Error creando notificación de cotización:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para respuesta del cliente
   */
  static async createResponseNotification(orderData) {
    try {
      const isAccepted = orderData.decision === 'accept';
      
      const notification = new Notification({
        title: isAccepted ? '✅ Orden Aceptada' : '❌ Orden Rechazada',
        message: `${orderData.customerName} ${isAccepted ? 'aceptó' : 'rechazó'} la cotización`,
        type: 'order_updated',
        priority: isAccepted ? 'high' : 'normal',
        data: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          decision: orderData.decision,
          modelType: orderData.modelType,
          price: orderData.price,
        },
        icon: isAccepted ? '🎉' : '😞',
      });

      return await notification.save();
    } catch (error) {
      console.error('❌ Error creando notificación de respuesta:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las notificaciones (más recientes primero)
   */
  static async getAllNotifications(limit = 50) {
    try {
      return await Notification
        .find()
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  static async getUnreadCount() {
    try {
      return await Notification.countDocuments({ isRead: false });
    } catch (error) {
      console.error('❌ Error obteniendo conteo no leídas:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(notificationId) {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas como leídas
   */
  static async markAllAsRead() {
    try {
      return await Notification.updateMany(
        { isRead: false },
        { isRead: true }
      );
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación
   */
  static async deleteNotification(notificationId) {
    try {
      return await Notification.findByIdAndDelete(notificationId);
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      throw error;
    }
  }

  /**
   * Eliminar todas las notificaciones
   */
  static async deleteAllNotifications() {
    try {
      return await Notification.deleteMany({});
    } catch (error) {
      console.error('❌ Error eliminando todas las notificaciones:', error);
      throw error;
    }
  }
}

export default NotificationService;