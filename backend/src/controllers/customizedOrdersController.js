import CustomizedOrder from '../models/customizedOrders.js';
import Cart from '../models/Cart.js';

/** Usuario sube imagen y crea la orden pendiente */
export const createCustomOrder = async (req, res) => {
  // 1) Verificar que el usuario está autenticado
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'No estás autenticado.' });
  }
  // 2) Verificar que modelType venga en el form-data
  const { modelType } = req.body;
  if (!modelType) {
    return res.status(400).json({ message: 'modelType es requerido.' });
  }
  // 3) Verificar que subió un archivo
  if (!req.file) {
    return res.status(400).json({ message: 'La imagen es requerida.' });
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    const order = new CustomizedOrder({
      user:      req.user.id,
      imageUrl,
      modelType
    });
    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: 'Error creando solicitud', error: err.message });
  }
};

/** Usuario ve sus encargos personalizados */
export const getMyCustomOrders = async (req, res) => {
  const orders = await CustomizedOrder.find({ user: req.user.id })
    .sort({ createdAt: -1 });
  res.json(orders);
};

/** Admin cotiza (si lo quieres luego) */
export const quoteCustomOrder = async (req, res) => {
  const { price, comment } = req.body;
  const order = await CustomizedOrder.findById(req.params.id);
  order.status  = 'quoted';
  order.price   = price;
  order.comment = comment;
  await order.save();
  res.json(order);
};

/** Usuario acepta/rechaza cotización */
export const respondCustomOrder = async (req, res) => {
  const { decision } = req.body; // 'accept' o 'reject'
  const order = await CustomizedOrder.findById(req.params.id);
  if (decision === 'reject') {
    order.status = 'pending';
    await order.save();
    return res.json(order);
  }
  // accept
  order.status = 'accepted';
  await order.save();
  // meter al carrito
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id });
  cart.customizedProducts.push({ item: order._id, quantity: 1 });
  await cart.save();
  res.json({ order, cart });
};
