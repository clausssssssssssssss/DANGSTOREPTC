import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Customer from "../models/Customers.js";
import SalesModel from "../models/Sale.js";
import Product from "../models/Product.js";
import CustomizedOrder from "../models/CustomizedOrder.js";
import StoreConfig from '../models/StoreConfig.js';
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

    // 🔍 LOG CRÍTICO: Ver estructura de items
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 ITEMS RECIBIDOS EN createOrder:');
    console.log(JSON.stringify(items, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verificar límites de pedidos semanales Y límite del catálogo
    const config = await StoreConfig.findOne();
    
    if (config) {
      // Verificar límite general de pedidos
      const canAcceptGeneral = config.canAcceptOrders();
      
      // Verificar límite específico del catálogo
      let canAcceptCatalog = true;
      
      if (config.stockLimits?.catalog?.isLimitActive) {
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

    // Verificar stock disponible para cada producto
    for (const item of items) {
      if (item.product && item.quantity) {
        const product = await Product.findById(item.product);
        if (product && !product.hasStockAvailable(item.quantity)) {
          return res.status(400).json({
            success: false,
            message: `Lo sentimos, no hay suficiente stock disponible para "${product.nombre}". Solo quedan ${product.disponibles} unidades.`,
            code: 'INSUFFICIENT_STOCK',
            productId: product._id,
            available: product.disponibles,
            requested: item.quantity
          });
        }
      }
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0
    );

    const order = new Order({
      user: userId,
      items,
      total: totalAmount,
      status: wompiStatus === "COMPLETED" ? "COMPLETED" : "PENDING",
      wompi: { orderID: wompiOrderID, captureStatus: wompiStatus },
    });

    const savedOrder = await order.save();

    await Customer.findByIdAndUpdate(userId, { $push: { orders: savedOrder._id } });

    if (wompiStatus === "COMPLETED") {
      // 🔥 CREAR VENTAS PARA CADA ÍTEM
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🛒 INICIANDO CREACIÓN DE VENTAS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      for (const item of items) {
        try {
          console.log('\n📋 Procesando item:', {
            type: item.type,
            itemId: item.item,
            productId: item.product,
            quantity: item.quantity,
            price: item.price
          });

          // Producto personalizado (cotización)
          if (item.type === 'custom') {
            const customOrderId = item.item || item.customOrder || item.id;
            console.log('🎨 Buscando orden personalizada con ID:', customOrderId);
            
            const customOrder = await CustomizedOrder.findById(customOrderId);
            
            if (customOrder) {
              console.log('✅ Orden personalizada encontrada:', {
                id: customOrder._id,
                price: customOrder.price,
                modelType: customOrder.modelType,
                status: customOrder.status
              });

              // Usar el precio del item o de la orden
              const itemPrice = item.price || customOrder.price || 0;
              const saleAmount = itemPrice * (item.quantity || 1);
              
              console.log('💰 Calculando venta:', {
                itemPrice,
                quantity: item.quantity || 1,
                saleAmount
              });

              // Crear venta para producto personalizado
              const newSale = await SalesModel.create({
                product: null,
                customer: userId,
                total: saleAmount,
                category: customOrder.modelType || 'Personalizado',
                date: new Date(),
                customOrder: customOrder._id
              });
              
              console.log('✅✅✅ VENTA CREADA EXITOSAMENTE');
              console.log('   ID de venta:', newSale._id);
              console.log('   Total:', saleAmount);
              console.log('   Categoría:', newSale.category);

              // Marcar la orden personalizada como completada
              if (customOrder.status !== 'completed') {
                customOrder.status = 'completed';
                customOrder.purchaseDate = new Date();
                await customOrder.save();
                console.log('✅ Orden personalizada marcada como completada');
              }
            } else {
              console.error('❌❌❌ ORDEN PERSONALIZADA NO ENCONTRADA');
              console.error('   ID buscado:', customOrderId);
            }
          }
          
          // Producto del catálogo
          else if (item.product || item.productId) {
            const productId = item.product || item.productId;
            console.log('📦 Buscando producto de catálogo con ID:', productId);
            
            const product = await Product.findById(productId);
            
            if (product) {
              console.log('✅ Producto encontrado:', {
                id: product._id,
                nombre: product.nombre,
                precio: product.precio,
                categoria: product.categoria
              });

              const itemPrice = item.price || product.precio || 0;
              const saleAmount = itemPrice * (item.quantity || 1);
              
              console.log('💰 Calculando venta:', {
                itemPrice,
                quantity: item.quantity || 1,
                saleAmount
              });

              // Crear venta para producto de catálogo
              const newSale = await SalesModel.create({
                product: product._id,
                customer: userId,
                total: saleAmount,
                category: product.categoria || 'Sin categoría',
                date: new Date()
              });
              
              console.log('✅✅✅ VENTA CREADA EXITOSAMENTE');
              console.log('   ID de venta:', newSale._id);
              console.log('   Total:', saleAmount);
              console.log('   Categoría:', newSale.category);
            } else {
              console.error('❌❌❌ PRODUCTO NO ENCONTRADO');
              console.error('   ID buscado:', productId);
            }
          } else {
            console.warn('⚠️⚠️⚠️ ITEM SIN IDENTIFICADOR VÁLIDO');
            console.warn('   Item completo:', item);
          }
        } catch (saleError) {
          console.error('❌❌❌ ERROR CREANDO VENTA');
          console.error('   Error:', saleError.message);
          console.error('   Stack:', saleError.stack);
        }
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ PROCESO DE VENTAS COMPLETADO');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Incrementar contador de pedidos semanales
      if (config) {
        await config.incrementOrderCount();
        
        // Incrementar contador de ventas del catálogo
        const now = new Date();
        const weekStart = new Date(config.orderLimits.weekStartDate);
        const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 7) {
          config.stockLimits.catalog.currentWeekSales = 1;
          config.orderLimits.weekStartDate = now;
        } else {
          config.stockLimits.catalog.currentWeekSales = (config.stockLimits.catalog.currentWeekSales || 0) + 1;
        }
        
        await config.save();
      }

      // Actualizar stock de productos de catálogo
      for (const item of items) {
        if (item.product && item.quantity) {
          const product = await Product.findById(item.product);
          if (product) {
            const newStock = Math.max(0, product.disponibles - item.quantity);
            await Product.findByIdAndUpdate(item.product, { disponibles: newStock });
            
            // Verificar si el producto se agotó
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

      // Limpiar carrito
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

    // Enviar correo de confirmación
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
        await sendEmail({ 
          to: customer.email, 
          subject, 
          html, 
          text: `Orden ${savedOrder._id} por $${totalAmount.toFixed(2)}` 
        });
      }
    } catch (mailErr) {
      console.error('❌ ERROR ENVIANDO CORREO DE CONFIRMACIÓN:', mailErr.message);
    }

    return res.status(201).json({ 
      success: true, 
      message: "Orden y venta registradas con éxito", 
      order: savedOrder 
    });
  } catch (error) {
    console.error("ERROR EN createOrder:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al crear la orden", 
      error: error.message 
    });
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