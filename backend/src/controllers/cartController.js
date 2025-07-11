// src/controllers/cartController.js
import Cart from '../models/Cart.js';

// Añade un producto o ítem personalizado al carrito
export const addToCart = async (req, res) => {
  console.log('📥 addToCart body:', req.body);
  console.log('👤 addToCart user:', req.user);
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, customItemId } = req.body;

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
    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('❌ Error añadiendo al carrito:', error);
    return res.status(500).json({ message: 'Error añadiendo al carrito', error: error.message });
  }
};

// Recupera el carrito (sin leer nada del body)
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    return res.status(200).json(cart);
  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    return res.status(500).json({ message: 'Error obteniendo carrito', error: error.message });
  }
};

// Actualiza la cantidad de un ítem
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      const idx = cart.products.findIndex(p => p.product.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Producto no en carrito' });
      cart.products[idx].quantity = quantity;
    } else if (type === 'custom') {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Ítem personalizado no en carrito' });
      cart.customizedProducts[idx].quantity = quantity;
    } else {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    await cart.save();
    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('❌ Error actualizando carrito:', error);
    return res.status(500).json({ message: 'Error actualizando carrito', error: error.message });
  }
};

// Elimina un ítem del carrito
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      cart.products = cart.products.filter(p => p.product.toString() !== itemId);
    } else if (type === 'custom') {
      cart.customizedProducts = cart.customizedProducts.filter(p => p.item.toString() !== itemId);
    } else {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    await cart.save();
    return res.status(200).json({ message: 'Ítem eliminado', cart });
  } catch (error) {
    console.error('❌ Error eliminando ítem:', error);
    return res.status(500).json({ message: 'Error eliminando ítem', error: error.message });
  }
};
