// src/controllers/customizedOrdersController.js
import CustomizedOrder from '../models/customizedOrders.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

/** Usuario sube imagen y crea la orden pendiente */
export const createCustomOrder = async (req, res) => {
  if (!req.user || (!req.user.id && !req.user.userId)) {
    return res.status(401).json({ message: 'No estás autenticado.' });
  }

  const { modelType, description } = req.body;
  const userId = req.user.id || req.user.userId;

  console.log("🧪 REQ.user.id:", userId);
  console.log("🧪 REQ.body:", req.body);
  console.log("🧪 REQ.file:", req.file);

  if (!modelType) {
    return res.status(400).json({ message: 'modelType es requerido.' });
  }
  if (!description) {
    return res.status(400).json({ message: 'description es requerido.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'La imagen es requerida.' });
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    const order = new CustomizedOrder({
      user: userId,
      imageUrl,
      modelType,
      description,
    });
    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    console.error("🔥 Error creando solicitud personalizada:", err);
    return res.status(500).json({
      message: "Error creando solicitud",
      error: err.message
    });
  }
};

/** Usuario ve sus encargos personalizados */
export const getMyCustomOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const orders = await CustomizedOrder.find({ user: userId })
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Error obteniendo encargos personalizados:", err);
    return res.status(500).json({ message: "Error obteniendo encargos", error: err.message });
  }
};

/** Admin obtiene todas las órdenes pendientes */
export const getAllPendingOrders = async (req, res) => {
  try {
    const orders = await CustomizedOrder.find({ status: 'pending' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Error obteniendo órdenes pendientes:", err);
    return res.status(500).json({ message: "Error obteniendo órdenes pendientes", error: err.message });
  }
};

/** Admin cotiza */
export const quoteCustomOrder = async (req, res) => {
  try {
    const { price, comment } = req.body;
    const order = await CustomizedOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Encargo personalizado no encontrado.' });
    }
    order.status = 'quoted';
    order.price = price;
    order.comment = comment;
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error("Error cotizando encargo personalizado:", err);
    return res.status(500).json({ message: "Error cotizando encargo", error: err.message });
  }
};

/** Usuario acepta o rechaza su cotización */
export const respondCustomOrder = async (req, res) => {
  try {
    const { decision } = req.body;
    const { id } = req.params;

    console.log('🔄 respondCustomOrder llamado con:', { decision, id });
    console.log('👤 Usuario autenticado:', req.user);
    console.log('🔑 ID del usuario:', req.user.id || req.user.userId);

    // Obtener el ID del usuario del objeto req.user
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      console.log('❌ No se pudo obtener el ID del usuario');
      return res.status(400).json({ message: 'ID de usuario no válido' });
    }

    // 1) Buscamos la orden
    const order = await CustomizedOrder.findById(id);
    if (!order) {
      console.log('❌ Orden no encontrada:', id);
      return res.status(404).json({ message: 'Encargo personalizado no encontrado.' });
    }

    console.log('✅ Orden encontrada:', order._id, 'Status actual:', order.status);

    // 2) Validamos la decisión
    if (decision !== 'accept' && decision !== 'reject') {
      console.log('❌ Decisión inválida:', decision);
      return res
        .status(400)
        .json({ message: 'El campo decision debe ser "accept" o "reject".' });
    }

    // 3) Procesamos el rechazo
    if (decision === 'reject') {
      console.log('🔄 Procesando rechazo...');
      order.status = 'rejected';
      order.decisionDate = new Date();
      order.decision = 'reject';
      await order.save();
      
      console.log('✅ Rechazo procesado correctamente');
      return res.json({
        message: 'Encargo rechazado correctamente',
        order
      });
    }

    // 4) Procesamos la aceptación
    console.log('🔄 Procesando aceptación...');
    order.status = 'accepted';
    order.decisionDate = new Date();
    order.decision = 'accept';
    await order.save();

    // 5) Lo metemos al carrito
    try {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        console.log('🛒 Creando nuevo carrito para usuario:', userId);
        cart = new Cart({ 
          user: userId,
          products: [],
          customizedProducts: []
        });
      }

      // Verificar si ya existe en el carrito
      const existingProduct = cart.customizedProducts.find(
        item => item.item.toString() === order._id.toString()
      );

      if (existingProduct) {
        console.log('🔄 Producto ya existe en carrito, actualizando cantidad');
        existingProduct.quantity += 1;
      } else {
        console.log('🆕 Agregando nuevo producto personalizado al carrito');
        cart.customizedProducts.push({ 
          item: order._id, 
          quantity: 1 
        });
      }

      await cart.save();
      console.log('✅ Carrito actualizado correctamente');

      // 6) Respuesta combinada
      return res.json({ 
        message: 'Encargo aceptado y agregado al carrito',
        order,
        cart: {
          id: cart._id,
          customizedProductsCount: cart.customizedProducts.length
        }
      });

    } catch (cartError) {
      console.error('❌ Error con el carrito:', cartError);
      // Si falla el carrito, al menos guardamos la decisión
      return res.json({ 
        message: 'Encargo aceptado pero hubo un problema con el carrito',
        order,
        cartError: cartError.message
      });
    }

  } catch (err) {
    console.error('❌ Error en respondCustomOrder:', err);
    return res
      .status(500)
      .json({ 
        message: 'Error procesando respuesta de encargo', 
        error: err.message 
      });
  }
};

// Agregar esta función al final de tu customizedOrdersController.js

/** Obtener una orden personalizada específica por ID */
export const getCustomOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const order = await CustomizedOrder.findOne({ 
      _id: req.params.id,
      user: userId // Solo sus propias órdenes
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Orden personalizada no encontrada' });
    }
    
    return res.json(order);
  } catch (err) {
    console.error("Error obteniendo orden personalizada:", err);
    return res.status(500).json({ message: "Error obteniendo orden", error: err.message });
  }
};