// src/controllers/customizedOrdersController.js
import CustomizedOrder from '../models/customizedOrders.js';
import Order from '../models/Order.js';

/** Usuario sube imagen y crea la orden pendiente */
export const createCustomOrder = async (req, res) => {
  // 1) Verificar que el usuario está autenticado
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'No estás autenticado.' });
  }

  // 2) Verificar que modelType y description vengan en el form-data
  const { modelType, description } = req.body;
  if (!modelType) {
    return res.status(400).json({ message: 'modelType es requerido.' });
  }
  if (!description) {
    return res.status(400).json({ message: 'description es requerido.' });
  }

  // 3) Verificar que subió un archivo
  if (!req.file) {
    return res.status(400).json({ message: 'La imagen es requerida.' });
  }

  try {
    // 4) Construir la URL y guardar
    const imageUrl = `/uploads/${req.file.filename}`;
    const order = new CustomizedOrder({
      user:        req.user.id,
      imageUrl,
      modelType,
      description,     // ← ahora sí lo pasamos
    });
    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    console.error("Error creando solicitud personalizada:", err);
    return res
      .status(500)
      .json({ message: "Error creando solicitud", error: err.message });
  }
};

/** Usuario ve sus encargos personalizados */
export const getMyCustomOrders = async (req, res) => {
  try {
    const orders = await CustomizedOrder.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Error obteniendo encargos personalizados:", err);
    return res.status(500).json({ message: "Error obteniendo encargos", error: err.message });
  }
};

/** Admin cotiza (si lo quieres luego) */
export const quoteCustomOrder = async (req, res) => {
  try {
    const { price, comment } = req.body;
    const order = await CustomizedOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Encargo personalizado no encontrado.' });
    }
    order.status  = 'quoted';
    order.price   = price;
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

    // 1) Buscamos la orden
    const order = await CustomizedOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Encargo personalizado no encontrado.' });
    }

    // 2) Validamos la decisión
    if (decision !== 'accept' && decision !== 'reject') {
      return res
        .status(400)
        .json({ message: 'El campo decision debe ser "accept" o "reject".' });
    }

    // 3) Procesamos el rechazo
    if (decision === 'reject') {
      order.status = 'pending';
      await order.save();
      return res.json(order);
    }

    // 4) Procesamos la aceptación
    order.status = 'accepted';
    await order.save();

    // 5) Lo metemos al carrito sólo si existe usuario
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id });
    cart.customizedProducts.push({ item: order._id, quantity: 1 });
    await cart.save();

    // 6) Respuesta combinada
    return res.json({ order, cart });
  } catch (err) {
    console.error('Error en respondCustomOrder:', err);
    return res
      .status(500)
      .json({ message: 'Error procesando respuesta de encargo', error: err.message });
  }
};
