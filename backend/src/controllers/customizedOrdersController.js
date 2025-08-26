import CustomizedOrder from '../models/CustomOrder.js';
import Customers from '../models/Customers.js';
import NotificationService from '../services/NotificationService.js';

/**
 * Crear nueva orden personalizada (desde web)
 */
export const createCustomOrder = async (req, res) => {
  try {
    console.log(' Creando orden personalizada...');
    console.log(' Body recibido:', req.body);
    console.log(' Usuario:', req.user);
    
    const { modelType, description } = req.body;
    const userId = req.user?.id || req.user?.userId;
    
    // Validaciones
    if (!modelType) {
      return res.status(400).json({
        success: false,
        message: 'modelType es requerido'
      });
    }
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'description es requerido'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    let imageUrl = '';

    // Si hay imagen subida
    if (req.file) {
      try {
        // Por ahora, guardamos la imagen como base64
        const imageBuffer = req.file.buffer;
        imageUrl = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
        console.log(' Imagen procesada como base64');
      } catch (imageError) {
        console.error(' Error procesando imagen:', imageError);
        return res.status(400).json({
          success: false,
          message: 'Error procesando la imagen'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'La imagen es requerida'
      });
    }

    // Crear la orden
    const customOrder = new CustomizedOrder({
      user: userId,
      imageUrl,
      modelType,
      description,
      status: 'pending'
    });

    console.log(' Guardando orden en base de datos...');
    const savedOrder = await customOrder.save();
    
    console.log(' Orden personalizada creada exitosamente:', savedOrder._id);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        id: savedOrder._id,
        modelType: savedOrder.modelType,
        description: savedOrder.description,
        status: savedOrder.status,
        createdAt: savedOrder.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error creando orden:', error);
    console.error(' Stack trace:', error.stack);
    
    // Error específico de MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incorrectos',
        error: error.message
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'production' ? 'Error interno' : error.message
    });
  }
};

/**
 * Obtener mis órdenes personalizadas (cliente)
 */
export const getMyCustomOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await CustomizedOrder
      .find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener orden por ID
 */
export const getCustomOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await CustomizedOrder
      .findById(id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener todas las órdenes pendientes (admin)
 */
export const getAllPendingOrders = async (req, res) => {
  try {
    const orders = await CustomizedOrder
      .find({ status: 'pending' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error obteniendo órdenes pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Cotizar orden (admin) - Y crear notificación
 */
export const quoteCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, comment } = req.body;

    const order = await CustomizedOrder
      .findByIdAndUpdate(
        id,
        { 
          price, 
          comment, 
          status: 'quoted' 
        },
        { new: true }
      )
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // 🔔 Crear notificación de cotización
    try {
      await NotificationService.createQuoteNotification({
        orderId: order._id,
        customerName: order.user.name,
        price: price,
        modelType: order.modelType
      });
    } catch (notificationError) {
      console.error('Error creando notificación de cotización:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Orden cotizada exitosamente',
      data: order
    });

  } catch (error) {
    console.error('Error cotizando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Responder a cotización (cliente) - Y crear notificación
 */
export const respondCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'accept' o 'reject'
    
    const order = await CustomizedOrder
      .findByIdAndUpdate(
        id,
        { 
          decision,
          decisionDate: new Date(),
          status: decision === 'accept' ? 'accepted' : 'rejected'
        },
        { new: true }
      )
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // 🔔 Crear notificación de respuesta del cliente
    try {
      await NotificationService.createResponseNotification({
        orderId: order._id,
        customerName: order.user.name,
        decision: decision,
        modelType: order.modelType,
        price: order.price
      });
    } catch (notificationError) {
      console.error('Error creando notificación de respuesta:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: `Orden ${decision === 'accept' ? 'aceptada' : 'rechazada'} exitosamente`,
      data: order
    });

  } catch (error) {
    console.error('Error respondiendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};