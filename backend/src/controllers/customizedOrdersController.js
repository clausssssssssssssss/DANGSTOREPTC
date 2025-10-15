import CustomizedOrder from '../models/CustomOrder.js';
import Customers from '../models/Customers.js';
import NotificationService from '../services/NotificationService.js';
import productController from './productController.js';
import StoreConfig from '../models/StoreConfig.js';

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

    // Verificar límite de encargos personalizados
    const config = await StoreConfig.findOne();
    if (config && config.stockLimits.customOrders.isLimitActive) {
      const now = new Date();
      const weekStart = new Date(config.orderLimits.weekStartDate);
      const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
      
      // Si han pasado más de 7 días, resetear el contador
      if (daysDiff >= 7) {
        config.stockLimits.customOrders.currentWeekOrders = 0;
        config.orderLimits.weekStartDate = now;
        await config.save();
      }
      
      const maxCustomOrders = config.stockLimits.customOrders.defaultMaxStock;
      const currentCustomOrders = config.stockLimits.customOrders.currentWeekOrders || 0;
      
      if (currentCustomOrders >= maxCustomOrders) {
        // Crear notificación de límite alcanzado si está habilitada
        try {
          const storeConfig = await StoreConfig.findOne();
          if (storeConfig && storeConfig.notifications?.orderLimitReachedEnabled) {
            await NotificationService.createOrderLimitReachedNotification({
              orderId: 'pending',
              customerName: req.user?.name || 'Cliente',
              limit: maxCustomOrders,
              currentCount: currentCustomOrders,
              modelType: modelType
            });
            console.log('✅ Notificación de límite de pedidos creada');
          }
        } catch (notificationError) {
          console.error('❌ Error creando notificación de límite:', notificationError);
        }

        return res.status(400).json({
          success: false,
          message: `Lo sentimos, hemos alcanzado el límite máximo de ${maxCustomOrders} encargos personalizados. Por favor, intenta nuevamente la próxima semana.`
        });
      }
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
    
    // Incrementar contador de encargos personalizados
    if (config && config.stockLimits.customOrders.isLimitActive) {
      const now = new Date();
      const weekStart = new Date(config.orderLimits.weekStartDate);
      const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
      
      // Si han pasado más de 7 días, resetear el contador
      if (daysDiff >= 7) {
        config.stockLimits.customOrders.currentWeekOrders = 1;
        config.orderLimits.weekStartDate = now;
      } else {
        config.stockLimits.customOrders.currentWeekOrders = (config.stockLimits.customOrders.currentWeekOrders || 0) + 1;
      }
      
      await config.save();
      console.log(' Contador de encargos personalizados incrementado');
      
      // Verificar si estamos cerca del límite y crear notificación preventiva
      const updatedConfig = await StoreConfig.findOne();
      const newCount = updatedConfig.stockLimits.customOrders.currentWeekOrders;
      const limit = updatedConfig.stockLimits.customOrders.defaultMaxStock;
      const threshold = Math.floor(limit * 0.8); // 80% del límite
      
      if (newCount >= threshold && newCount < limit && updatedConfig.notifications?.orderLimitReachedEnabled) {
        try {
          await NotificationService.createOrderLimitReachedNotification({
            orderId: savedOrder._id,
            customerName: req.user?.name || 'Cliente',
            limit: limit,
            currentCount: newCount,
            modelType: modelType
          });
          console.log(`⚠️ Notificación preventiva: ${newCount}/${limit} encargos personalizados`);
        } catch (notificationError) {
          console.error('❌ Error creando notificación preventiva:', notificationError);
        }
      }
    }
    
    console.log(' Orden personalizada creada exitosamente:', savedOrder._id);

    //  Crear notificación de nuevo encargo
    try {
      await NotificationService.createNewOrderNotification({
        orderId: savedOrder._id,
        modelType: savedOrder.modelType,
        description: savedOrder.description
      });
      console.log(' Notificación de nuevo encargo creada');
    } catch (notificationError) {
      console.error(' Error creando notificación de nuevo encargo:', notificationError);
    }

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
    console.error(' Error creando orden:', error);
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
    const userId = req.user?.id || req.user?.userId;
    
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
 * Obtener todas las órdenes (admin) - para filtros
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await CustomizedOrder
      .find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
  
    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error obteniendo todas las órdenes:', error);
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

    //  Crear notificación de cotización
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
 * Rechazar orden (admin) - Y crear notificación
 */
export const rejectCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Razón del rechazo (opcional)

    const order = await CustomizedOrder
      .findByIdAndUpdate(
        id,
        { 
          status: 'rejected',
          rejectionReason: reason,
          rejectionDate: new Date()
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

    // Crear notificación de rechazo del admin
    try {
      await NotificationService.createRejectionNotification({
        orderId: order._id,
        customerName: order.user.name,
        modelType: order.modelType,
        reason: reason || 'Sin razón especificada'
      });
    } catch (notificationError) {
      console.error('Error creando notificación de rechazo:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Orden rechazada exitosamente',
      data: order
    });

  } catch (error) {
    console.error('Error rechazando orden:', error);
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

    // Variable para guardar el ID del producto creado
    let createdProductId = null;

    // Si el cliente acepta el encargo, crear automáticamente un producto en el catálogo
    if (decision === 'accept') {
      try {
        console.log('🎉 Cliente aceptó el encargo, creando producto en el catálogo...');
        const newProduct = await productController.createProductFromCustomOrder(order._id);
        console.log('✅ Producto agregado al catálogo:', newProduct._id);
        
        // Guardar el ID del producto creado
        createdProductId = newProduct._id;
        
        // Actualizar el encargo con referencia al producto creado
        await CustomizedOrder.findByIdAndUpdate(order._id, {
          $set: { catalogProductId: newProduct._id }
        });
        
      } catch (productError) {
        console.error('❌ Error creando producto desde encargo aceptado:', productError);
        // No fallar la respuesta si hay error creando el producto
      }
    }

    // Crear notificación de respuesta del cliente
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

    // 🔥 CAMBIO: Retornar el productId creado
    console.log('📤 Enviando respuesta al frontend:', {
      success: true,
      message: `Orden ${decision === 'accept' ? 'aceptada' : 'rechazada'} exitosamente`,
      productId: createdProductId,
      isNewProduct: createdProductId !== null
    });
    
    res.status(200).json({
      success: true,
      message: `Orden ${decision === 'accept' ? 'aceptada' : 'rechazada'} exitosamente`,
      data: order,
      productId: createdProductId,           // ← NUEVO
      isNewProduct: createdProductId !== null // ← NUEVO
    });

  } catch (error) {
    console.error('Error respondiendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Eliminar orden personalizada
 */
export const deleteCustomOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id || req.user?.userId;
    
    // Buscar la orden
    const order = await CustomizedOrder.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden personalizada no encontrada'
      });
    }
    
    // Verificar que el usuario sea el propietario de la orden
    console.log('Debug eliminación:', {
      orderUserId: order.user.toString(),
      requestUserId: userId.toString(),
      areEqual: order.user.toString() === userId.toString()
    });
    
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta orden'
      });
    }
    
    // Eliminar la orden
    await CustomizedOrder.findByIdAndDelete(orderId);
    
    res.json({
      success: true,
      message: 'Orden personalizada eliminada correctamente'
    });
    
  } catch (error) {
    console.error('Error eliminando orden personalizada:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};