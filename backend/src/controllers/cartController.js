// src/controllers/cartController.js
import Cart from '../models/Cart.js';

const cartController = {};

/**
 * GET /api/cart
 * Devuelve el carrito del usuario (por JWT en req.userId)
 */
cartController.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno al obtener carrito' });
  }
};

/**
 * POST /api/cart/add
 * { productId, quantity }
 */
cartController.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx >= 0) {
      cart.items[idx].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno al agregar al carrito' });
  }
};

/**
 * DELETE /api/cart/remove/:productId
 */
cartController.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno al quitar del carrito' });
  }
};

/**
 * DELETE /api/cart/clear
 */
cartController.clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    cart.items = [];
    await cart.save();
    res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno al vaciar carrito' });
  }
};

export default cartController;
