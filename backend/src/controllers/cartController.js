import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Customer from "../models/Customers.js";
import SalesModel from "../models/Sale.js";
import Product from "../models/Product.js";
import { sendEmail } from "../utils/mailService.js";
import NotificationService from '../services/NotificationService.js';

// ─── Función auxiliar para normalizar productos ───
function normalizeCartProduct(p) {
  if (!p.product) return null;
  return {
    ...p.toObject ? p.toObject() : p,
    product: {
      ...p.product.toObject ? p.product.toObject() : p.product,
      price: p.product.price ?? p.product.precio ?? 0,
      name: p.product.name || p.product.nombre || 'Sin nombre',
      description: p.product.description || p.product.descripcion || '',
      images: p.product.images?.length ? p.product.images : (p.product.imagen ? [p.product.imagen] : [])
    }
  };
}

// ─── Añadir producto o ítem personalizado ───
export const addToCart = async (req, res) => {
  console.log('addToCart body:', req.body);
  console.log('addToCart user:', req.user);
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

    // Repoblar y normalizar
    cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    cart.products = cart.products.map(normalizeCartProduct).filter(Boolean);

    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('Error añadiendo al carrito:', error);
    return res.status(500).json({ message: 'Error añadiendo al carrito', error: error.message });
  }
};

// ─── Obtener carrito ───
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.products = cart.products.map(normalizeCartProduct).filter(Boolean);

    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return res.status(500).json({ message: 'Error obteniendo carrito', error: error.message });
  }
};

// ─── Actualizar cantidad ───
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
    } else return res.status(400).json({ message: 'Tipo inválido' });

    await cart.save();

    cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    cart.products = cart.products.map(normalizeCartProduct).filter(Boolean);

    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    return res.status(500).json({ message: 'Error actualizando carrito', error: error.message });
  }
};

// ─── Eliminar ítem ───
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
    } else return res.status(400).json({ message: 'Tipo inválido' });

    await cart.save();

    cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    cart.products = cart.products.map(normalizeCartProduct).filter(Boolean);

    return res.status(200).json({ message: 'Ítem eliminado', cart });
  } catch (error) {
    console.error('Error eliminando ítem:', error);
    return res.status(500).json({ message: 'Error eliminando ítem', error: error.message });
  }
};

// ─── Crear orden ───
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!req.user || !userId) {
      return res.status(401).json({ success: false, message: "Usuario no autenticado" });
    }

    const { items, total, wompiOrderID, wompiStatus } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items inválidos" });
    }

    // Verificar límites de pedidos semanales Y límite del catálogo
    const StoreConfig = (await import('../models/StoreConfig.js')).default;
    const config = await StoreConfig.findOne();
    
    if (config) {
      // Verificar límite general de pedidos
      const canAcceptGeneral = config.canAcceptOrders();
      
      // Verificar límite específico del catálogo
      let canAcceptCatalog = true;
      
      if (config.stockLimits.catalog.isLimitActive) {
        const now = new Date();
        const weekStart = new Date(config.orderLimits.weekStartDate);
        const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
        
        // Si han pasado más de 7 días, resetear el contador del catálogo
        if (daysDiff >= 7) {
          config.stockLimits.catalog.currentWeekSales = 0;
          config.orderLimits.weekStartDate = now;
          await config.save();
        }
        
        const maxCatalogOrders = config.stockLimits.catalog.defaultMaxStock;
        const currentCatalogSales = config.stockLimits.catalog.currentWeekSales || 0;
        canAcceptCatalog = currentCatalogSales < maxCatalogOrders;
        
        if (!canAcceptCatalog) {
          return res.status(400).json({
            success: false,
            message: `Lo sentimos, hemos alcanzado el límite máximo de ${maxCatalogOrders} productos del catálogo. Por favor, intenta nuevamente la próxima semana.`,
            code: 'CATALOG_LIMIT_REACHED'
          });
        }
      }
      
      // Verificar límite general de pedidos
      if (!canAcceptGeneral) {
        return res.status(400).json({
          success: false,
          message: `Lo sentimos, hemos alcanzado el límite máximo de ${config.orderLimits.weeklyMaxOrders} pedidos semanales. Por favor, intenta nuevamente la próxima semana.`,
          code: 'ORDER_LIMIT_REACHED'
        });
      }
    }

    // Verificar stock disponible para cada producto y enriquecer con datos del producto
    const Product = (await import('../models/Product.js')).default;
    const enrichedItems = [];
    
    for (const item of items) {
      if (item.product && item.quantity) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Producto no encontrado: ${item.product}`,
            code: 'PRODUCT_NOT_FOUND'
          });
        }
        
        if (!product.hasStockAvailable(item.quantity)) {
          return res.status(400).json({
            success: false,
            message: `Lo sentimos, no hay suficiente stock disponible para "${product.nombre}". Solo quedan ${product.disponibles} unidades.`,
            code: 'INSUFFICIENT_STOCK',
            productId: product._id,
            available: product.disponibles,
            requested: item.quantity
          });
        }
        
        // Enriquecer el item con datos del producto
        enrichedItems.push({
          product: product._id,
          productName: product.nombre,
          productDescription: product.descripcion,
          productImage: product.images?.[0] || null,
          quantity: item.quantity,
          price: product.precio || product.price || 0
        });
      } else if (item.customItem) {
        // Para ítems personalizados, mantener como están
        enrichedItems.push(item);
      }
    }

    const totalAmount = enrichedItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0
    );

    const order = new Order({
      user: userId,
      items: enrichedItems,
      total: totalAmount,
      status: wompiStatus === "COMPLETED" ? "COMPLETED" : "PENDING",
      wompi: { orderID: wompiOrderID, captureStatus: wompiStatus },
    });

    const savedOrder = await order.save();

    await Customer.findByIdAndUpdate(userId, { $push: { orders: savedOrder._id } });

    if (wompiStatus === "COMPLETED") {
      // Incrementar contador de pedidos semanales
      if (config) {
        await config.incrementOrderCount();
        
        // Incrementar contador de ventas del catálogo
        const now = new Date();
        const weekStart = new Date(config.orderLimits.weekStartDate);
        const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
        
        // Si han pasado más de 7 días, resetear el contador
        if (daysDiff >= 7) {
          config.stockLimits.catalog.currentWeekSales = 1;
          config.orderLimits.weekStartDate = now;
        } else {
          config.stockLimits.catalog.currentWeekSales = (config.stockLimits.catalog.currentWeekSales || 0) + 1;
        }
        
        await config.save();
      }

              for (const item of enrichedItems) {
                if (item.product && item.quantity) {
                  const product = await Product.findById(item.product);
                  if (product) {
                    const newStock = Math.max(0, product.disponibles - item.quantity);
                    await Product.findByIdAndUpdate(item.product, { disponibles: newStock });
                    
                    // Verificar si el producto se agotó y enviar notificación
                    if (newStock === 0 && config?.notifications?.lowStockEnabled) {
                      try {
                        await NotificationService.createLowStockNotification({
                          productId: product._id,
                          productName: product.nombre,
                          available: newStock
                        });
                      } catch (notificationError) {
                        console.error('Error creando notificación de stock bajo:', notificationError);
                      }
                    }
                  }
                }
              }
      await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [], customizedProducts: [] } });
      
      // Crear notificación para pedido completado
      try {
        const customer = await Customer.findById(userId).select('name email');
        await NotificationService.createPurchaseNotification({
          orderId: savedOrder._id,
          customerName: customer?.name || 'Cliente',
          total: totalAmount,
          itemsCount: items.length
        });
        console.log('✅ Notificación de compra creada:', savedOrder._id);
      } catch (notificationError) {
        console.error('❌ Error creando notificación de compra:', notificationError);
      }
    }

    try {
      const productIds = items.map(item => item.product).filter(Boolean);
      const newSale = new SalesModel({ products: productIds, customer: userId, total: totalAmount, date: new Date() });
      await newSale.save();
    } catch (salesError) {
      console.warn("Error al guardar venta:", salesError.message);
    }

    try {
      const customer = await Customer.findById(userId).select('email name');
      if (customer?.email) {
        const subject = 'Confirmación de pedido - DANGSTORE';
        const html = `<div style="font-family: Arial, sans-serif;">
          <h2>¡Gracias por tu compra, ${customer.name || ''}!</h2>
          <p>Tu pedido fue registrado correctamente.</p>
          <p><strong>Número de orden:</strong> ${savedOrder._id}</p>
          <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
          <p>Estado: ${savedOrder.status}</p>
          <hr/>
          <p>Si no reconoces esta operación, contáctanos.</p>
        </div>`;
        await sendEmail({ to: customer.email, subject, html, text: `Orden ${savedOrder._id} por $${totalAmount.toFixed(2)}` });
      }
    } catch (mailErr) {
      console.error('❌ ERROR ENVIANDO CORREO DE CONFIRMACIÓN:', mailErr.message);
      console.error('❌ Detalles del error:', mailErr);
    }

    return res.status(201).json({ success: true, message: "Orden y venta registradas con éxito", order: savedOrder });
  } catch (error) {
    console.error("ERROR EN createOrder:", error);
    return res.status(500).json({ success: false, message: "Error al crear la orden", error: error.message });
  }
};

// ─── Obtener órdenes ───
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price");
    return res.status(200).json(orders);
  } catch (err) {
    console.error("Error obteniendo órdenes:", err);
    return res.status(500).json({ message: "Error al obtener órdenes" });
  }
};
