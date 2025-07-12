import Cart from '../models/Cart.js';

// Añadir producto o ítem personalizado al carrito del usuario
export const addToCart = async (req, res) => {
  console.log('📥 addToCart body:', req.body);
  console.log('👤 addToCart user:', req.user);
  try {
    const userId = req.user.id; // saco el id del usuario autenticado
    const { productId, quantity = 1, customItemId } = req.body; // datos que llegan para añadir

    // Busco el carrito del usuario, si no hay, creo uno nuevo
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId });

    // Si se manda productId, busco si ya está en carrito
    if (productId) {
      const idx = cart.products.findIndex(p => p.product.toString() === productId);
      if (idx >= 0) {
        // Ya existe, solo aumento la cantidad
        cart.products[idx].quantity += quantity;
      } else {
        // No existe, agrego nuevo producto con la cantidad dada
        cart.products.push({ product: productId, quantity });
      }
    }

    // Igual para ítems personalizados (customItemId)
    if (customItemId) {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === customItemId);
      if (idx >= 0) {
        // Si ya está, aumento cantidad
        cart.customizedProducts[idx].quantity += quantity;
      } else {
        // Si no está, agrego nuevo ítem personalizado
        cart.customizedProducts.push({ item: customItemId, quantity });
      }
    }

    // Guardo el carrito actualizado
    await cart.save();

    // Respondo que todo salió bien y mando el carrito actualizado
    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    // Si algo falla, muestro error por consola y respondo error al cliente
    console.error('❌ Error añadiendo al carrito:', error);
    return res.status(500).json({ message: 'Error añadiendo al carrito', error: error.message });
  }
};

// Obtener el carrito del usuario, con productos e ítems personalizados
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // id del usuario que pidió el carrito
    // Busco carrito y relleno referencias de productos e ítems
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    if (!cart) {
      // Si no hay carrito, aviso que no lo encontré
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Devuelvo el carrito encontrado
    return res.status(200).json(cart);
  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    return res.status(500).json({ message: 'Error obteniendo carrito', error: error.message });
  }
};

// Actualizar la cantidad de un producto o ítem personalizado en el carrito
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type, quantity } = req.body;

    // Busco carrito del usuario
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    // Dependiendo si es producto o ítem personalizado, busco y actualizo la cantidad
    if (type === 'product') {
      const idx = cart.products.findIndex(p => p.product.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Producto no en carrito' });
      cart.products[idx].quantity = quantity;
    } else if (type === 'custom') {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Ítem personalizado no en carrito' });
      cart.customizedProducts[idx].quantity = quantity;
    } else {
      // Tipo inválido
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    // Guardo cambios en carrito
    await cart.save();

    // Confirmo que se actualizó
    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('❌ Error actualizando carrito:', error);
    return res.status(500).json({ message: 'Error actualizando carrito', error: error.message });
  }
};

// Eliminar un producto o ítem personalizado del carrito
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type } = req.body;

    // Busco carrito
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    // Filtro para eliminar el producto o ítem que coincida con itemId
    if (type === 'product') {
      cart.products = cart.products.filter(p => p.product.toString() !== itemId);
    } else if (type === 'custom') {
      cart.customizedProducts = cart.customizedProducts.filter(p => p.item.toString() !== itemId);
    } else {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    // Guardo carrito sin el item eliminado
    await cart.save();

    // Confirmo que se eliminó el ítem
    return res.status(200).json({ message: 'Ítem eliminado', cart });
  } catch (error) {
    console.error('❌ Error eliminando ítem:', error);
    return res.status(500).json({ message: 'Error eliminando ítem', error: error.message });
  }
};
