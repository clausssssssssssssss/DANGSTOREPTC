import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Customer from "../models/Customers.js";



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

    // Re-poblar productos antes de enviar
    cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

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
 
   await cart.save();
 
// Re-poblar productos antes de enviar
cart = await Cart.findOne({ user: userId })
  .populate('products.product')
  .populate('customizedProducts.item');
 
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

    // Elimino producto o ítem personalizado
    if (type === 'product') {
      cart.products = cart.products.filter(p => p.product.toString() !== itemId);
    } else if (type === 'custom') {
      cart.customizedProducts = cart.customizedProducts.filter(p => p.item.toString() !== itemId);
    } else {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    // Guardo cambios
    await cart.save();

    // Re-poblar el carrito para traer datos completos de productos e ítems
    cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    // Devuelvo carrito actualizado tras eliminar ítem
    return res.status(200).json({ message: 'Ítem eliminado', cart });
  } catch (error) {
    console.error('❌ Error eliminando ítem:', error);
    return res.status(500).json({ message: 'Error eliminando ítem', error: error.message });
  }
};

//---------------Crear Orden---------------------//
export const createOrder = async (req, res) => {
  console.log("🛒 ============= INICIO createOrder =============");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("📦 Body recibido:", req.body);
  console.log("👤 User recibido:", req.user);
  console.log("🔍 req.user.id:", req.user?.id);
  console.log("🔍 req.user._id:", req.user?._id);
  
  try {
    // Usar consistencia con otras funciones (req.user.id)
    const userId = req.user.id;
    
    if (!req.user || !userId) {
      console.error("❌ Usuario no autenticado");
      return res.status(401).json({ 
        success: false, 
        message: "Usuario no autenticado" 
      });
    }

    console.log("✅ Usuario autenticado con ID:", userId);

    const { items, total, wompiOrderID, wompiStatus } = req.body;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Items inválidos:", items);
      return res.status(400).json({ 
        success: false, 
        message: "Items inválidos" 
      });
    }

    console.log("✅ Items válidos, cantidad:", items.length);

    // Crear la orden usando req.user.id (consistente con otras funciones)
    const order = new Order({
      user: userId, // usar req.user.id como en otras funciones
      items,
      total,
      status: wompiStatus === "COMPLETED" ? "COMPLETED" : "PENDING",
      wompi: { orderID: wompiOrderID, captureStatus: wompiStatus }
    });

    console.log("🏗️ Orden creada, intentando guardar...");
    const savedOrder = await order.save();
    console.log("🎉 ¡ORDEN GUARDADA! ID:", savedOrder._id);

    // Actualizar cliente
    await Customer.findByIdAndUpdate(userId, { $push: { orders: savedOrder._id } });

    // Limpiar carrito
    if (wompiStatus === "COMPLETED") {
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { products: [], customizedProducts: [] } }
      );
    }

    return res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      order: savedOrder
    });
  } catch (error) {
    console.error("💥 ERROR EN createOrder:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error al crear orden",
      error: error.message 
    });
  }
};

// --------------------- OBTENER HISTORIAL DE ÓRDENES ---------------------

export const getOrders = async (req, res) => {
  try {
    // Usar consistencia en el ID del usuario
    const userId = req.user.id || req.user._id;
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price");
    return res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error obteniendo órdenes:", err);
    return res.status(500).json({ message: "Error al obtener órdenes" });
  }
};