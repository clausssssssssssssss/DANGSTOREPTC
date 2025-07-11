// src/controllers/cartController.js
import Cart from '../models/Cart.js';            // Modelo de carritos de compra
import Product from '../models/Product.js';      // Modelo de productos estándar
import CustomizedOrder from '../models/customizedOrders.js';  // Modelo de órdenes personalizadas

// Añade un producto o ítem personalizado al carrito
export const addToCart = async (req, res) => {
  try {
    // Extrae datos del body: ID de usuario, ID de producto, cantidad e ID de ítem personalizado
    const { userId, productId, quantity = 1, customItemId } = req.body;

    // Busca el carrito del usuario o crea uno nuevo
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId });

    // Si se proporciona un producto estándar
    if (productId) {
      // Verifica si el producto ya existe en el carrito
      const idx = cart.products.findIndex(p => p.product.toString() === productId);
      if (idx >= 0) 
        cart.products[idx].quantity += quantity;  // Incrementa la cantidad existente
      else 
        cart.products.push({ product: productId, quantity });  // Agrega el producto nuevo
    }

    // Si se proporciona un ítem personalizado
    if (customItemId) {
      // Verifica si el ítem personalizado ya existe en el carrito
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === customItemId);
      if (idx >= 0) 
        cart.customizedProducts[idx].quantity += quantity;  // Incrementa la cantidad existente
      else 
        cart.customizedProducts.push({ item: customItemId, quantity });  // Agrega el ítem personalizado
    }

    // Guarda los cambios en la base de datos
    await cart.save();

    // Retorna el carrito actualizado
    res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    // En caso de error, loguea y envía una respuesta 500
    console.error('Error añadiendo al carrito:', error);
    res.status(500).json({ message: 'Error añadiendo al carrito', error });
  }
};

// Obtiene el carrito de un usuario con sus productos e ítems personalizados
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;  // ID de usuario en ruta

    // Busca el carrito y llena referencias a productos e ítems
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    if (!cart) 
      return res.status(404).json({ message: 'Carrito no encontrado' });  // 404 si no existe

    res.status(200).json(cart);  // Devuelve el carrito completo
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ message: 'Error obteniendo carrito', error: error.message });
  }
};

// Actualiza la cantidad de un ítem en el carrito según tipo (product/custom)
export const updateCartItem = async (req, res) => {
  try {
    const { userId, itemId, type, quantity } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) 
      return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      // Busca índice del producto estándar
      const idx = cart.products.findIndex(p => p.product.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Producto no en carrito' });
      cart.products[idx].quantity = quantity;  // Actualiza cantidad
    } else if (type === 'custom') {
      // Busca índice del ítem personalizado
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Ítem personalizado no en carrito' });
      cart.customizedProducts[idx].quantity = quantity;  // Actualiza cantidad
    }

    await cart.save();
    res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({ message: 'Error actualizando carrito', error });
  }
};

// Elimina un ítem (producto o personalizado) del carrito
export const removeCartItem = async (req, res) => {
  try {
    const { userId, itemId, type } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) 
      return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      // Filtra el producto a eliminar
      cart.products = cart.products.filter(p => p.product.toString() !== itemId);
    } else if (type === 'custom') {
      // Filtra el ítem personalizado a eliminar
      cart.customizedProducts = cart.customizedProducts.filter(p => p.item.toString() !== itemId);
    }

    await cart.save();
    res.status(200).json({ message: 'Ítem eliminado', cart });
  } catch (error) {
    console.error('Error eliminando ítem:', error);
    res.status(500).json({ message: 'Error eliminando ítem', error });
  }
};