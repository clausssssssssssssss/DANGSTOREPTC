import Order from '../models/Order.js';
import NotificationService from '../services/NotificationService.js';

// Aceptar entrega programada
export const acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    if (order.deliveryStatus !== 'READY_FOR_DELIVERY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Este pedido no está listo para confirmar entrega' 
      });
    }

    // Actualizar estado del pedido
    order.deliveryConfirmed = true;
    order.deliveryStatus = 'DELIVERED';
    
    // Agregar al historial
    order.statusHistory.push({
      status: 'DELIVERED',
      changedBy: 'customer',
      changedAt: new Date(),
      notes: 'Cliente confirmó la entrega programada'
    });

    await order.save();

    // Crear notificación para el admin
    try {
      await NotificationService.createDeliveryConfirmedNotification({
        orderId: order._id,
        customerId: userId,
        deliveryDate: order.deliveryDate
      });
    } catch (notificationError) {
      console.error('Error creando notificación de entrega confirmada:', notificationError);
    }

    res.json({ 
      success: true, 
      message: 'Entrega confirmada exitosamente',
      order: order 
    });

  } catch (error) {
    console.error('Error aceptando entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Rechazar entrega programada
export const rejectDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    if (order.deliveryStatus !== 'READY_FOR_DELIVERY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Este pedido no está listo para rechazar entrega' 
      });
    }

    // Actualizar estado del pedido
    order.reschedulingStatus = 'REQUESTED';
    order.reschedulingReason = reason || 'Cliente solicitó reprogramación';
    
    // Agregar al historial
    order.statusHistory.push({
      status: 'RESCHEDULING_REQUESTED',
      changedBy: 'customer',
      changedAt: new Date(),
      notes: reason || 'Cliente solicitó reprogramación de entrega'
    });

    await order.save();

    // Crear notificación para el admin
    try {
      await NotificationService.createRescheduleRequestNotification({
        orderId: order._id,
        customerId: userId,
        reason: reason || 'Cliente solicitó reprogramación'
      });
    } catch (notificationError) {
      console.error('Error creando notificación de solicitud de reprogramación:', notificationError);
    }

    res.json({ 
      success: true, 
      message: 'Solicitud de reprogramación enviada al administrador',
      order: order 
    });

  } catch (error) {
    console.error('Error rechazando entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener pedidos del usuario
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const orders = await Order.find({ user: userId })
      .populate('deliveryPoint', 'nombre direccion')
      .populate('items.product', 'nombre precio imagen')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      orders: orders 
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};
