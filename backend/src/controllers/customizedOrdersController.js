import CustomizedOrder from '../models/CustomOrder.js';
import Customer from '../models/Customers.js'; // Asumiendo que tienes este modelo
import NotificationService from '../services/NotificationService.js';

/**
 * Crear nueva orden personalizada (desde web)
 */
export const createCustomOrder = async (req, res) => {
  try {
    const { modelType, description, userId } = req.body;
    let imageUrl = '';

    // Si hay imagen subida
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Crear la orden
    const customOrder = new CustomizedOrder({
      user: userId,
      imageUrl,
      modelType,
      description,
      status: 'pending'
    });

    const savedOrder = await customOrder.save();
    
    // Obtener datos del cliente para la notificación
    const customer = await Customer.findById(userId);
    
    // 🔔 CREAR NOTIFICACIÓN para el admin en la app móvil
    try {
      await NotificationService.createOrderNotification({
        orderId: savedOrder._id,
        customerName: customer ? customer.name : 'Cliente desconocido',
        modelType: modelType,
        imageUrl: imageUrl
      });
    } catch (notificationError) {
      console.error('Error creando notificación:', notificationError);
      // No fallar la creación de la orden por un error de notificación
    }

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: savedOrder
    });

  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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