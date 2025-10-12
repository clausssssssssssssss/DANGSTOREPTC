import Order from '../models/Order.js';
import DeliveryPoint from '../models/DeliveryPoint.js';
import { sendEmail } from '../utils/mailService.js';
import NotificationService from '../services/NotificationService.js';

// Programar entrega por el admin
export const scheduleDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryDate } = req.body;
    
    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de entrega es requerida'
      });
    }
    
    const order = await Order.findById(orderId)
      .populate('user', 'nombre email')
      .populate('deliveryPoint');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Validar que la orden esté en revisión o pagada
    if (order.deliveryStatus !== 'REVIEWING' && order.deliveryStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden programar entregas para órdenes en revisión o pagadas'
      });
    }
    
    // Actualizar la orden
    order.deliveryDate = new Date(deliveryDate);
    order.deliveryStatus = 'READY_FOR_DELIVERY';
    order.deliveryConfirmed = false;
    order.statusHistory.push({
      status: 'READY_FOR_DELIVERY',
      changedBy: 'admin',
      notes: `Entrega programada para ${new Date(deliveryDate).toLocaleString('es-SV')}`
    });
    
    await order.save();
    
    // Enviar email al cliente
    if (order.user && order.user.email) {
      const deliveryDateFormatted = new Date(deliveryDate).toLocaleString('es-SV', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
      
      const confirmUrl = `${process.env.FRONTEND_URL}/confirmar-entrega/${orderId}`;
      
      await sendEmail(
        order.user.email,
        'Entrega Programada - DangStore',
        `
          <h2>¡Tu entrega ha sido programada!</h2>
          <p>Hola ${order.user.nombre},</p>
          <p>Tu pedido #${orderId.slice(-8)} ha sido programado para entrega.</p>
          <p><strong>Fecha y hora:</strong> ${deliveryDateFormatted}</p>
          <p><strong>Punto de entrega:</strong> ${order.deliveryPoint?.nombre || 'Por definir'}</p>
          <p><strong>Dirección:</strong> ${order.deliveryPoint?.direccion || 'Por definir'}</p>
          <hr>
          <p>Por favor, confirma tu disponibilidad:</p>
          <p>
            <a href="${confirmUrl}?action=confirm" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px;">
              ✅ Confirmar Entrega
            </a>
            <a href="${confirmUrl}?action=reschedule" style="background: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px;">
              📅 Solicitar Reprogramación
            </a>
          </p>
          <p>Gracias por tu preferencia,<br>Equipo DangStore</p>
        `
      );
    }
    
    res.json({
      success: true,
      message: 'Entrega programada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error programando entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al programar entrega'
    });
  }
};

// Confirmar entrega por el cliente
export const confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'nombre email')
      .populate('deliveryPoint');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Validar que la orden esté programada
    if (order.deliveryStatus !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden confirmar entregas programadas'
      });
    }
    
    // Actualizar la orden
    order.deliveryStatus = 'CONFIRMED';
    order.deliveryConfirmed = true;
    order.reschedulingStatus = 'NONE';
    order.statusHistory.push({
      status: 'CONFIRMED',
      changedBy: 'customer',
      notes: 'Cliente confirmó la entrega'
    });
    
    await order.save();
    
    // Crear notificación para el admin
    try {
      await NotificationService.createDeliveryConfirmedNotification({
        orderId: order._id,
        customerName: order.user?.nombre || 'Cliente',
        deliveryDate: order.deliveryDate
      });
      console.log('Notificación de confirmación enviada al admin');
    } catch (notificationError) {
      console.error('Error creando notificación:', notificationError);
    }
    
    res.json({
      success: true,
      message: 'Entrega confirmada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error confirmando entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar entrega'
    });
  }
};

// Solicitar reprogramación por el cliente
export const requestRescheduling = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Debes indicar tus días y horas disponibles'
      });
    }
    
    const order = await Order.findById(orderId)
      .populate('user', 'nombre email')
      .populate('deliveryPoint');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Validar que la orden esté programada o confirmada
    if (!['SCHEDULED', 'CONFIRMED'].includes(order.deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden reprogramar entregas programadas o confirmadas'
      });
    }
    
    // Actualizar la orden
    order.reschedulingReason = reason;
    order.reschedulingStatus = 'REQUESTED';
    order.statusHistory.push({
      status: 'RESCHEDULING_REQUESTED',
      changedBy: 'customer',
      notes: `Cliente solicitó reprogramación. Disponibilidad: ${reason}`
    });
    
    await order.save();
    
    // Crear notificación para el admin
    try {
      await NotificationService.createRescheduleRequestNotification({
        orderId: order._id,
        customerName: order.user?.nombre || 'Cliente',
        reason: reason,
        currentDeliveryDate: order.deliveryDate
      });
      console.log('Notificación de reprogramación enviada al admin');
    } catch (notificationError) {
      console.error('Error creando notificación:', notificationError);
    }
    
    res.json({
      success: true,
      message: 'Solicitud de reprogramación enviada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error solicitando reprogramación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al solicitar reprogramación'
    });
  }
};

// Aprobar/rechazar reprogramación por el admin
export const handleRescheduling = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approve, newDate } = req.body;
    
    const order = await Order.findById(orderId)
      .populate('user', 'nombre email')
      .populate('deliveryPoint');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Validar que haya una solicitud de reprogramación
    if (order.reschedulingStatus !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: 'No hay solicitud de reprogramación pendiente'
      });
    }
    
    if (approve) {
      // Aprobar reprogramación
      if (!newDate) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar una nueva fecha de entrega'
        });
      }
      const finalDate = new Date(newDate);
      order.deliveryDate = finalDate;
      order.deliveryStatus = 'SCHEDULED';
      order.reschedulingStatus = 'APPROVED';
      order.deliveryConfirmed = false;
      order.statusHistory.push({
        status: 'RESCHEDULING_APPROVED',
        changedBy: 'admin',
        notes: `Reprogramación aprobada para ${finalDate.toLocaleString('es-SV')}`
      });
      
      // Enviar email al cliente
      if (order.user && order.user.email) {
        const deliveryDateFormatted = finalDate.toLocaleString('es-SV', {
          dateStyle: 'full',
          timeStyle: 'short'
        });
        
        const confirmUrl = `${process.env.FRONTEND_URL}/confirmar-entrega/${orderId}`;
        
        await sendEmail(
          order.user.email,
          'Reprogramación Aprobada - DangStore',
          `
            <h2>¡Tu reprogramación ha sido aprobada!</h2>
            <p>Hola ${order.user.nombre},</p>
            <p>Tu solicitud de reprogramación para el pedido #${orderId.slice(-8)} ha sido aprobada.</p>
            <p><strong>Nueva fecha y hora:</strong> ${deliveryDateFormatted}</p>
            <p><strong>Punto de entrega:</strong> ${order.deliveryPoint?.nombre || 'Por definir'}</p>
            <p><strong>Dirección:</strong> ${order.deliveryPoint?.direccion || 'Por definir'}</p>
            <hr>
            <p>Por favor, confirma tu disponibilidad:</p>
            <p>
              <a href="${confirmUrl}?action=confirm" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px;">
                ✅ Confirmar Entrega
              </a>
            </p>
            <p>Gracias por tu preferencia,<br>Equipo DangStore</p>
          `
        );
      }
    } else {
      // Rechazar reprogramación
      order.reschedulingStatus = 'REJECTED';
      order.statusHistory.push({
        status: 'RESCHEDULING_REJECTED',
        changedBy: 'admin',
        notes: 'Reprogramación rechazada por el admin'
      });
      
      // Enviar email al cliente
      if (order.user && order.user.email) {
        await sendEmail(
          order.user.email,
          'Reprogramación Rechazada - DangStore',
          `
            <h2>Reprogramación No Aprobada</h2>
            <p>Hola ${order.user.nombre},</p>
            <p>Lamentamos informarte que tu solicitud de reprogramación para el pedido #${orderId.slice(-8)} no pudo ser aprobada.</p>
            <p>La entrega se mantiene programada para: ${order.deliveryDate?.toLocaleString('es-SV', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}</p>
            <p>Si tienes alguna duda, por favor contáctanos.</p>
            <p>Gracias por tu comprensión,<br>Equipo DangStore</p>
          `
        );
      }
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: approve ? 'Reprogramación aprobada exitosamente' : 'Reprogramación rechazada',
      order
    });
  } catch (error) {
    console.error('Error manejando reprogramación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la reprogramación'
    });
  }
};

// Actualizar estado de entrega por el admin
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['PAID', 'SCHEDULED', 'CONFIRMED', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de entrega inválido'
      });
    }
    
    const order = await Order.findById(orderId)
      .populate('user', 'nombre email')
      .populate('deliveryPoint');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    const previousStatus = order.deliveryStatus;
    order.deliveryStatus = status;
    order.statusHistory.push({
      status,
      changedBy: 'admin',
      notes: notes || `Estado actualizado de ${previousStatus} a ${status}`
    });
    
    await order.save();
    
    // Enviar email al cliente sobre el cambio de estado
    if (order.user && order.user.email) {
      const statusMessages = {
        'PAID': 'Tu pedido ha sido pagado y está en proceso',
        'SCHEDULED': 'Tu entrega ha sido programada',
        'CONFIRMED': 'Tu entrega ha sido confirmada',
        'READY_FOR_DELIVERY': 'Tu pedido está listo para entrega',
        'DELIVERED': 'Tu pedido ha sido entregado',
        'CANCELLED': 'Tu pedido ha sido cancelado'
      };
      
      await sendEmail(
        order.user.email,
        `Actualización de Pedido - DangStore`,
        `
          <h2>Actualización de tu pedido #${orderId.slice(-8)}</h2>
          <p>Hola ${order.user.nombre},</p>
          <p><strong>${statusMessages[status]}</strong></p>
          ${notes ? `<p>Notas: ${notes}</p>` : ''}
          ${order.deliveryDate ? `<p>Fecha de entrega: ${order.deliveryDate.toLocaleString('es-SV', { dateStyle: 'full', timeStyle: 'short' })}</p>` : ''}
          <p>Gracias por tu preferencia,<br>Equipo DangStore</p>
        `
      );
    }
    
    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      order
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado'
    });
  }
};

// Obtener órdenes por estado de entrega (para el admin)
export const getOrdersByDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { deliveryStatus: status } : {};
    
    const orders = await Order.find(filter)
      .populate('user', 'nombre email telefono')
      .populate('deliveryPoint')
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes'
    });
  }
};

// Obtener solicitudes de reprogramación pendientes (para el admin)
export const getPendingReschedulingRequests = async (req, res) => {
  try {
    const orders = await Order.find({ reschedulingStatus: 'REQUESTED' })
      .populate('user', 'nombre email telefono')
      .populate('deliveryPoint')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      requests: orders
    });
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes de reprogramación'
    });
  }
};

// Cambiar estado del pedido a "MAKING" (elaborando)
export const startMakingOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Validar que la orden esté en revisión
    if (order.deliveryStatus !== 'REVIEWING') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede iniciar elaboración de órdenes en revisión'
      });
    }
    
    // Actualizar estado a "MAKING"
    order.deliveryStatus = 'MAKING';
    order.statusHistory.push({
      status: 'MAKING',
      changedBy: 'admin',
      changedAt: new Date(),
      notes: 'Iniciando elaboración del pedido'
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Estado actualizado a "Elaborando"',
      order: order
    });
    
  } catch (error) {
    console.error('Error iniciando elaboración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

