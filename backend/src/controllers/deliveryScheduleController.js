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
    
    // Validar que la orden esté en revisión, pagada o en elaboración
    if (order.deliveryStatus !== 'REVIEWING' && order.deliveryStatus !== 'PAID' && order.deliveryStatus !== 'MAKING') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden programar entregas para órdenes en revisión, pagadas o en elaboración'
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
      console.log('📧 Enviando email de entrega programada...');
      console.log('👤 Destinatario:', order.user.email);
      console.log('📅 Fecha de entrega:', deliveryDate);
      
      const deliveryDateFormatted = new Date(deliveryDate).toLocaleString('es-SV', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
      
      const confirmUrl = `${process.env.FRONTEND_URL}/confirmar-entrega/${orderId}`;
      console.log('🔗 URL de confirmación:', confirmUrl);
      
      await sendEmail({
        to: order.user.email,
        subject: '📦 Tu pedido está listo para entrega - DangStore',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Entrega Programada - DangStore</title>
          </head>
          <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f8fc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
              
              <!-- Header con gradiente -->
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
                  📦 DANGSTORE
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
                  ¡Tu pedido está listo para entrega!
                </p>
              </div>
              
              <!-- Contenido principal -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">
                    🎉 ¡Tu pedido está listo!
                  </h2>
                  <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                    Hola <strong>${order.user.nombre || 'Cliente'}</strong>,<br>
                    Tu pedido ha sido programado para entrega.
                  </p>
                </div>
                
                <!-- Información de entrega -->
                <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 25px 0;">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 20px; margin-right: 10px;">📅</span>
                    <div>
                      <p style="margin: 0; color: #374151; font-weight: 600;">Fecha programada:</p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">${deliveryDateFormatted}</p>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 20px; margin-right: 10px;">📍</span>
                    <div>
                      <p style="margin: 0; color: #374151; font-weight: 600;">Punto de entrega:</p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">${order.deliveryPoint?.nombre || 'Por definir'}</p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">${order.deliveryPoint?.direccion || 'Dirección por definir'}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Botones de acción -->
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #374151; font-size: 16px; margin-bottom: 20px; font-weight: 500;">
                    Por favor, confirma tu disponibilidad:
                  </p>
                  
                  <a href="${confirmUrl}?action=confirm" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 5px 10px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                    ✅ Aceptar Entrega
                  </a>
                  
                  <a href="${confirmUrl}?action=reschedule" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 5px 10px; font-weight: 600; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    📅 Solicitar Reprogramación
                  </a>
                </div>
                
                <!-- Información del pedido -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                    📋 Detalles del Pedido
                  </h3>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Pedido #:</strong> ${orderId.slice(-8)}
                  </p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Total:</strong> $${order.total?.toFixed(2) || '0.00'}
                  </p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Fecha de pedido:</strong> ${new Date(order.createdAt).toLocaleDateString('es-SV')}
                  </p>
                </div>
                
                <!-- Instrucciones -->
                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 25px 0;">
                  <p style="color: #1e40af; font-size: 14px; margin: 0; font-weight: 500;">
                    💡 <strong>Importante:</strong> Revisa tu perfil en la app para conocer todos los detalles de entrega y poder confirmar o reprogramar tu entrega.
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  Gracias por tu preferencia,<br>
                  <strong>Equipo DangStore</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.4;">
                  © 2024 DANGSTORE. Todos los derechos reservados.<br>
                  Este es un mensaje automático generado por el sistema.
                </p>
              </div>
              
            </div>
          </body>
          </html>
        `
      });
      
      console.log('✅ Email enviado exitosamente');
    } else {
      console.log('⚠️ No se pudo enviar email: usuario sin email');
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
    
    console.log('🔍 Confirmando entrega para orden:', orderId);
    
    const order = await Order.findById(orderId)
      .populate('user', 'nombre email')
      .populate('deliveryPoint');
    
    if (!order) {
      console.log('❌ Orden no encontrada:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    console.log('📦 Estado actual de la orden:', order.deliveryStatus);
    console.log('📦 Orden completa:', {
      _id: order._id,
      deliveryStatus: order.deliveryStatus,
      deliveryDate: order.deliveryDate,
      deliveryConfirmed: order.deliveryConfirmed,
      user: order.user ? { nombre: order.user.nombre, email: order.user.email } : null
    });
    
    // Validar que la orden esté programada
    if (order.deliveryStatus !== 'READY_FOR_DELIVERY') {
      console.log('❌ Estado inválido para confirmación:', order.deliveryStatus);
      return res.status(400).json({
        success: false,
        message: `Solo se pueden confirmar entregas programadas. Estado actual: ${order.deliveryStatus}`
      });
    }
    
    // Validar que la orden tenga fecha de entrega
    if (!order.deliveryDate) {
      console.log('❌ Orden sin fecha de entrega');
      return res.status(400).json({
        success: false,
        message: 'La orden no tiene fecha de entrega programada'
      });
    }
    
    // Actualizar la orden
    console.log('🔄 Actualizando orden...');
    order.deliveryStatus = 'CONFIRMED';
    order.deliveryConfirmed = true;
    order.reschedulingStatus = 'NONE';
    
    // Validar que statusHistory existe
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    order.statusHistory.push({
      status: 'CONFIRMED',
      changedBy: 'customer',
      changedAt: new Date(),
      notes: 'Cliente confirmó la entrega'
    });
    
    console.log('💾 Guardando orden en base de datos...');
    await order.save();
    console.log('✅ Orden guardada exitosamente');
    
    console.log('✅ Orden actualizada exitosamente a CONFIRMED');
    
    // Crear notificación para el admin (no crítico)
    try {
      await NotificationService.createDeliveryConfirmedNotification({
        orderId: order._id,
        customerName: order.user?.nombre || 'Cliente',
        deliveryDate: order.deliveryDate
      });
      console.log('📧 Notificación de confirmación enviada al admin');
    } catch (notificationError) {
      console.error('❌ Error creando notificación (no crítico):', notificationError.message);
      // No lanzamos el error porque la confirmación ya se completó exitosamente
    }
    
    res.json({
      success: true,
      message: 'Entrega confirmada exitosamente',
      order
    });
  } catch (error) {
    console.error('❌ ERROR DETALLADO al confirmar entrega:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    res.status(500).json({
      success: false,
      message: `Error al confirmar entrega: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
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
    if (!['READY_FOR_DELIVERY', 'CONFIRMED'].includes(order.deliveryStatus)) {
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
      order.deliveryStatus = 'READY_FOR_DELIVERY';
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
    
    const validStatuses = ['PAID', 'REVIEWING', 'MAKING', 'SCHEDULED', 'CONFIRMED', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
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
        'READY_FOR_DELIVERY': 'Tu entrega ha sido programada',
        'CONFIRMED': 'Tu entrega ha sido confirmada',
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

// Eliminar una orden específica (para el admin)
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    await Order.findByIdAndDelete(orderId);
    
    res.json({
      success: true,
      message: 'Orden eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la orden'
    });
  }
};

// Eliminar todas las órdenes (para el admin)
export const deleteAllOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    
    console.log(`Eliminadas ${result.deletedCount} órdenes`);
    
    res.json({
      success: true,
      message: `Se eliminaron ${result.deletedCount} órdenes`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error eliminando órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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

