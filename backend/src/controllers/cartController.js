// src/controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import CustomizedOrder from '../models/customizedOrders.js';

/**
 * Añade un producto o ítem personalizado al carrito de un cliente.
 */
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1, customItemId } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId });

    if (productId) {
      const idx = cart.products.findIndex(p => p.product.toString() === productId);
      if (idx >= 0) cart.products[idx].quantity += quantity;
      else cart.products.push({ product: productId, quantity });
    }

    if (customItemId) {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === customItemId);
      if (idx >= 0) cart.customizedProducts[idx].quantity += quantity;
      else cart.customizedProducts.push({ item: customItemId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('Error añadiendo al carrito:', error);
    res.status(500).json({ message: 'Error añadiendo al carrito', error });
  }
};

/**
 * Obtiene el carrito de un cliente y sus productos personalizados.
 */
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ message: 'Error obteniendo carrito', error: error.message });
  }
};

/**
 * Actualiza la cantidad de un ítem en el carrito.
 */
export const updateCartItem = async (req, res) => {
  try {
    const { userId, itemId, type, quantity } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      const idx = cart.products.findIndex(p => p.product.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Producto no en carrito' });
      cart.products[idx].quantity = quantity;
    } else if (type === 'custom') {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Ítem personalizado no en carrito' });
      cart.customizedProducts[idx].quantity = quantity;
    }

    await cart.save();
    res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({ message: 'Error actualizando carrito', error });
  }
};

/**
 * Elimina un ítem del carrito.
 */
export const removeCartItem = async (req, res) => {
  try {
    const { userId, itemId, type } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      cart.products = cart.products.filter(p => p.product.toString() !== itemId);
    } else if (type === 'custom') {
      cart.customizedProducts = cart.customizedProducts.filter(p => p.item.toString() !== itemId);
    }

    await cart.save();
    res.status(200).json({ message: 'Ítem eliminado', cart });
  } catch (error) {
    console.error('Error eliminando ítem:', error);
    res.status(500).json({ message: 'Error eliminando ítem', error });
  }
};
