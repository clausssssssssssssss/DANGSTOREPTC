import Notification from '../models/Notifications.js';

class NotificationService {
  
  /**
   * Crear notificación para nueva orden personalizada
   */
  static async createOrderNotification(orderData) {
    try {
      const notification = new Notification({
        title: ' Nueva Orden Personalizada',
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
      console.log(' Notificación creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error(' Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para compra normal (catálogo)
   */
  static async createPurchaseNotification(orderData) {
    try {
      const notification = new Notification({
        title: ' Nueva Compra Realizada',
        message: `${orderData.customerName} compró productos por $${orderData.total}`,
        type: 'purchase',
        priority: 'normal',
        data: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          total: orderData.total,
          itemsCount: orderData.itemsCount,
        },
        icon: '🛒',
      });

      const savedNotification = await notification.save();
      console.log(' Notificación de compra creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error(' Error creando notificación de compra:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para nuevo encargo (sin customerName)
   */
  static async createNewOrderNotification(orderData) {
    try {
      const notification = new Notification({
        title: ' Nuevo Encargo Personalizado',
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
      console.log(' Notificación de nuevo encargo creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error(' Error creando notificación de nuevo encargo:', error);
      throw error;
    }
  }

  /**
   * Crear notificación de stock bajo
   */
  static async createLowStockNotification(productData) {
    try {
      const notification = new Notification({
        title: 'Stock Agotado',
        message: `El producto "${productData.productName}" se ha agotado (${productData.available} unidades disponibles)`,
        type: 'low_stock',
        priority: 'high',
        data: {
          productId: productData.productId,
          productName: productData.productName,
          available: productData.available
        },
        icon: '⚠️',
      });

      const savedNotification = await notification.save();
      console.log(' Notificación de stock bajo creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error(' Error creando notificación de stock bajo:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para orden cotizada
   */
  static async createQuoteNotification(orderData) {
    try {
      const notification = new Notification({
        title: 'Orden Cotizada',
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
      console.error(' Error creando notificación de cotización:', error);
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
        title: isAccepted ? ' Orden Aceptada' : ' Orden Rechazada',
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
      console.error(' Error creando notificación de respuesta:', error);
      throw error;
    }
  }

  /**
   * Crear notificación para rating de producto
   */
  static async createRatingNotification(ratingData) {
    try {
      console.log('🔔 Creando notificación de rating con datos:', ratingData);
      
      const notification = new Notification({
        title: ' Nueva Calificación',
        message: `${ratingData.customerName} calificó un producto con ${ratingData.rating} estrellas`,
        type: 'rating',
        priority: 'normal',
        data: {
          productId: ratingData.productId,
          customerName: ratingData.customerName,
          rating: ratingData.rating,
          productName: ratingData.productName,
          comment: ratingData.comment,
        },
        icon: '⭐',
      });

      console.log('🔔 Notificación creada, guardando...');
      const savedNotification = await notification.save();
      console.log('✅ Notificación de rating creada exitosamente:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('❌ Error creando notificación de rating:', error);
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
      console.error(' Error obteniendo notificaciones:', error);
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
      console.error(' Error marcando como leída:', error);
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
      console.error(' Error marcando todas como leídas:', error);
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
      console.error(' Error eliminando notificación:', error);
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
      console.error(' Error eliminando todas las notificaciones:', error);
      throw error;
    }
  }


  /**
   * Crear notificación cuando cliente solicita reprogramación
   */
  static async createRescheduleRequestNotification(orderData) {
    try {
      const notification = new Notification({
        title: 'Solicitud de Reprogramación',
        message: `${orderData.customerName} solicitó reprogramar la entrega del pedido #${orderData.orderId.slice(-8)}`,
        type: 'reschedule_request',
        priority: 'high',
        data: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          reason: orderData.reason,
          currentDeliveryDate: orderData.currentDeliveryDate,
        },
        icon: '📅',
      });

      const savedNotification = await notification.save();
      console.log('Notificación de solicitud de reprogramación creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('Error creando notificación de solicitud de reprogramación:', error);
      throw error;
    }
  }

  /**
   * Crear notificación cuando se alcanza el límite de pedidos
   */
  static async createOrderLimitReachedNotification(orderData) {
    try {
      const isLimitReached = orderData.currentCount >= orderData.limit;
      const isNearLimit = orderData.currentCount >= Math.floor(orderData.limit * 0.8);
      
      let title, message, icon;
      
      if (isLimitReached) {
        title = 'Límite de Pedidos Alcanzado';
        message = `Se ha alcanzado el límite de ${orderData.limit} pedidos. Nuevo pedido de ${orderData.customerName} no pudo ser procesado.`;
        icon = '🚫';
      } else if (isNearLimit) {
        title = 'Límite de Pedidos Cerca';
        message = `Se han recibido ${orderData.currentCount} de ${orderData.limit} pedidos permitidos esta semana. Quedan ${orderData.limit - orderData.currentCount} disponibles.`;
        icon = '⚠️';
      } else {
        title = 'Límite de Pedidos';
        message = `Se han recibido ${orderData.currentCount} de ${orderData.limit} pedidos permitidos esta semana.`;
        icon = '📊';
      }

      const notification = new Notification({
        title: title,
        message: message,
        type: 'order_limit_reached',
        priority: isLimitReached ? 'high' : isNearLimit ? 'normal' : 'low',
        data: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          limit: orderData.limit,
          currentCount: orderData.currentCount,
          modelType: orderData.modelType,
        },
        icon: icon,
      });

      const savedNotification = await notification.save();
      console.log('Notificación de límite de pedidos creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('Error creando notificación de límite de pedidos:', error);
      throw error;
    }
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  static async getUnreadCount() {
    try {
      console.log('🔔 Service: Obteniendo conteo de notificaciones no leídas...');
      
      // Verificar que el modelo existe
      if (!Notification) {
        throw new Error('Modelo Notification no está definido');
      }
      
      const totalCount = await Notification.countDocuments({});
      console.log('🔔 Service: Total notificaciones:', totalCount);
      
      const unreadCount = await Notification.countDocuments({ isRead: false });
      console.log('🔔 Service: No leídas:', unreadCount);
      
      return unreadCount;
    } catch (error) {
      console.error('❌ Service: Error obteniendo conteo no leídas:', error);
      console.error('❌ Service: Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Crear notificación cuando cliente confirma entrega
   */
  static async createDeliveryConfirmedNotification(data) {
    try {
      console.log('🔔 Creando notificación de entrega confirmada con datos:', data);
      
      const notification = new Notification({
        title: 'Entrega Confirmada',
        message: `${data.customerName || 'El cliente'} confirmó la entrega del pedido #${data.orderId.slice(-8)}`,
        type: 'delivery_confirmed',
        priority: 'normal',
        data: {
          orderId: data.orderId,
          customerName: data.customerName,
          deliveryDate: data.deliveryDate,
        },
        icon: '✅',
      });

      const savedNotification = await notification.save();
      console.log('✅ Notificación de entrega confirmada creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('❌ Error creando notificación de entrega confirmada:', error);
      throw error;
    }
  }

  /**
   * Crear notificación cuando cliente solicita reprogramación
   */
  static async createRescheduleRequestNotification(data) {
    try {
      const notification = new Notification({
        title: 'Solicitud de Reprogramación',
        message: `El cliente ha solicitado reprogramar la entrega. Motivo: ${data.reason}`,
        type: 'reschedule_request',
        priority: 'high',
        data: {
          orderId: data.orderId,
          customerId: data.customerId,
          reason: data.reason,
        },
        icon: '🔄',
      });

      const savedNotification = await notification.save();
      console.log('Notificación de solicitud de reprogramación creada:', savedNotification._id);
      
      return savedNotification;
    } catch (error) {
      console.error('Error creando notificación de solicitud de reprogramación:', error);
      throw error;
    }
  }
}

export default NotificationService;