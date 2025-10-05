import StoreConfig from '../models/StoreConfig.js';
import Product from '../models/Product.js';
import NotificationService from '../services/NotificationService.js';

/**
 * Obtener configuración de la tienda
 */
export const getStoreConfig = async (req, res) => {
  try {
    let config = await StoreConfig.findOne();
    
    // Si no existe configuración, crear una por defecto
    if (!config) {
      config = new StoreConfig();
      await config.save();
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error obteniendo configuración de tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualizar configuración de la tienda
 */
export const updateStoreConfig = async (req, res) => {
  try {
    const { orderLimits, stockLimits, isStoreActive, notifications } = req.body;
    
    console.log('🔧 Actualizando configuración de tienda...');
    console.log('📊 Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🎯 Stock limits recibidos:', JSON.stringify(stockLimits, null, 2));
    
    let config = await StoreConfig.findOne();
    
    if (!config) {
      console.log('📝 Creando nueva configuración...');
      config = new StoreConfig();
    } else {
      console.log('📝 Configuración existente encontrada');
    }
    
    // Actualizar límites de pedidos
    if (orderLimits) {
      config.orderLimits = { ...config.orderLimits, ...orderLimits };
    }
    
    // Actualizar límites de stock de forma más segura
    if (stockLimits) {
      // Asegurar que la estructura existe
      if (!config.stockLimits) {
        config.stockLimits = {};
      }
      
      // Actualizar configuración general
      if (stockLimits.isStockLimitActive !== undefined) {
        config.stockLimits.isStockLimitActive = stockLimits.isStockLimitActive;
      }
      
      // Actualizar límite global
      if (stockLimits.global) {
        if (!config.stockLimits.global) {
          config.stockLimits.global = {
            defaultMaxStock: 50,
            isLimitActive: false
          };
        }
        if (stockLimits.global.defaultMaxStock !== undefined) {
          config.stockLimits.global.defaultMaxStock = stockLimits.global.defaultMaxStock;
        }
        if (stockLimits.global.isLimitActive !== undefined) {
          config.stockLimits.global.isLimitActive = stockLimits.global.isLimitActive;
        }
      }
      
      // Actualizar límites por tipo
      if (stockLimits.catalog) {
        if (!config.stockLimits.catalog) {
          config.stockLimits.catalog = {
            defaultMaxStock: 10,
            isLimitActive: true,
            currentWeekSales: 0
          };
        }
        if (stockLimits.catalog.defaultMaxStock !== undefined) {
          config.stockLimits.catalog.defaultMaxStock = stockLimits.catalog.defaultMaxStock;
        }
        if (stockLimits.catalog.isLimitActive !== undefined) {
          config.stockLimits.catalog.isLimitActive = stockLimits.catalog.isLimitActive;
        }
      }
      
      if (stockLimits.customOrders) {
        if (!config.stockLimits.customOrders) {
          config.stockLimits.customOrders = {
            defaultMaxStock: 20,
            isLimitActive: true,
            currentWeekOrders: 0
          };
        }
        if (stockLimits.customOrders.defaultMaxStock !== undefined) {
          config.stockLimits.customOrders.defaultMaxStock = stockLimits.customOrders.defaultMaxStock;
        }
        if (stockLimits.customOrders.isLimitActive !== undefined) {
          config.stockLimits.customOrders.isLimitActive = stockLimits.customOrders.isLimitActive;
        }
      }
      
      // Compatibilidad con campos legacy
      if (stockLimits.defaultMaxStock !== undefined) {
        config.stockLimits.defaultMaxStock = stockLimits.defaultMaxStock;
      }
    }
    
    // Actualizar estado de la tienda
    if (typeof isStoreActive === 'boolean') {
      config.isStoreActive = isStoreActive;
    }
    
    // Actualizar configuraciones de notificaciones
    if (notifications) {
      config.notifications = { ...config.notifications, ...notifications };
    }
    
    await config.save();
    
    console.log('✅ Configuración guardada exitosamente');
    console.log('📊 Configuración final:', JSON.stringify(config.stockLimits, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: config
    });
  } catch (error) {
    console.error('Error actualizando configuración de tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Verificar si se pueden aceptar más pedidos (incluye límite del catálogo)
 */
export const canAcceptOrders = async (req, res) => {
  try {
    const config = await StoreConfig.findOne();
    
    if (!config) {
      return res.status(200).json({
        success: true,
        canAccept: true,
        message: 'No hay límites configurados'
      });
    }
    
    // Verificar límite específico del catálogo (más restrictivo)
    let canAcceptCatalog = true;
    let remainingCatalogOrders = 0;
    
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
      remainingCatalogOrders = Math.max(0, maxCatalogOrders - currentCatalogSales);
    }
    
    // Solo usar el límite del catálogo para productos del catálogo
    const canAccept = canAcceptCatalog;
    
    res.status(200).json({
      success: true,
      canAccept,
      remainingOrders: Math.max(0, remainingCatalogOrders),
      currentWeekOrders: config.stockLimits.catalog.currentWeekSales || 0,
      weeklyMaxOrders: config.stockLimits.catalog.defaultMaxStock,
      isCatalogLimit: true
    });
  } catch (error) {
    console.error('Error verificando límites de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Incrementar contador de pedidos
 */
export const incrementOrderCount = async (req, res) => {
  try {
    const config = await StoreConfig.findOne();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de tienda no encontrada'
      });
    }
    
    await config.incrementOrderCount();
    
    res.status(200).json({
      success: true,
      message: 'Contador de pedidos incrementado',
      currentWeekOrders: config.orderLimits.currentWeekOrders
    });
  } catch (error) {
    console.error('Error incrementando contador de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Verificar stock disponible para un producto
 */
export const checkProductStock = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const config = await StoreConfig.findOne();
    const hasStock = product.hasStockAvailable(parseInt(quantity));
    const effectiveLimit = product.getEffectiveStockLimit(config);
    
    // Si no hay stock suficiente, devolver error
    if (!hasStock) {
      return res.status(400).json({
        success: false,
        hasStock: false,
        available: product.disponibles,
        requested: parseInt(quantity),
        message: `No hay suficiente stock disponible. Solo quedan ${product.disponibles} unidades.`
      });
    }
    
    res.status(200).json({
      success: true,
      hasStock: true,
      available: product.disponibles,
      requested: parseInt(quantity),
      effectiveLimit,
      isStockLimitActive: product.stockLimits.isStockLimitActive
    });
  } catch (error) {
    console.error('Error verificando stock de producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualizar límites de stock de un producto
 */
export const updateProductStockLimits = async (req, res) => {
  try {
    const { productId } = req.params;
    const { maxStock, isStockLimitActive } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (typeof maxStock === 'number') {
      product.stockLimits.maxStock = maxStock;
    }
    
    if (typeof isStockLimitActive === 'boolean') {
      product.stockLimits.isStockLimitActive = isStockLimitActive;
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Límites de stock actualizados',
      data: {
        productId: product._id,
        stockLimits: product.stockLimits
      }
    });
  } catch (error) {
    console.error('Error actualizando límites de stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener productos con stock bajo
 */
export const getLowStockProducts = async (req, res) => {
  try {
    const config = await StoreConfig.findOne();
    if (!config) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const products = await Product.find({
      'stockLimits.isStockLimitActive': true
    });
    
    const lowStockProducts = products.filter(product => {
      const effectiveLimit = product.getEffectiveStockLimit(config);
      return effectiveLimit && product.disponibles <= effectiveLimit * 0.2; // 20% del límite
    });
    
    res.status(200).json({
      success: true,
      data: lowStockProducts.map(product => ({
        _id: product._id,
        nombre: product.nombre,
        disponibles: product.disponibles,
        effectiveLimit: product.getEffectiveStockLimit(config),
        stockPercentage: (product.disponibles / product.getEffectiveStockLimit(config)) * 100
      }))
    });
  } catch (error) {
    console.error('Error obteniendo productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Verificar límite de encargos personalizados
 */
/**
 * Verificar límite global (catálogo + encargos personalizados)
 */
export const checkGlobalLimit = async (req, res) => {
  try {
    const config = await StoreConfig.findOne();
    
    if (!config) {
      return res.status(200).json({
        success: true,
        canBuy: true,
        currentTotalOrders: 0,
        maxTotalOrders: 30, // 10 catálogo + 20 encargos por defecto
        remaining: 30,
        message: 'No hay límites globales configurados'
      });
    }
    
    // Verificar si hay límite global activo
    const hasGlobalLimit = config.stockLimits?.catalog?.isLimitActive || 
                          config.stockLimits?.customOrders?.isLimitActive;
    
    if (!hasGlobalLimit) {
      return res.status(200).json({
        success: true,
        canBuy: true,
        currentTotalOrders: 0,
        maxTotalOrders: 30,
        remaining: 30,
        message: 'Límites globales desactivados'
      });
    }
    
    // Contar total de pedidos en la semana actual
    const now = new Date();
    const weekStart = new Date(config.orderLimits.weekStartDate);
    const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
    
    // Si han pasado más de 7 días, resetear contadores
    if (daysDiff >= 7) {
      config.stockLimits.catalog.currentWeekSales = 0;
      config.stockLimits.customOrders.currentWeekOrders = 0;
      config.orderLimits.weekStartDate = now;
      await config.save();
    }
    
    const catalogSales = config.stockLimits.catalog.currentWeekSales || 0;
    const customOrders = config.stockLimits.customOrders.currentWeekOrders || 0;
    const totalOrders = catalogSales + customOrders;
    
    const maxCatalog = config.stockLimits.catalog.defaultMaxStock || 10;
    const maxCustom = config.stockLimits.customOrders.defaultMaxStock || 20;
    const maxTotal = maxCatalog + maxCustom;
    
    const canBuy = totalOrders < maxTotal;
    
    res.status(200).json({
      success: true,
      canBuy,
      currentTotalOrders: totalOrders,
      maxTotalOrders: maxTotal,
      remaining: Math.max(0, maxTotal - totalOrders),
      catalogSales,
      customOrders,
      maxCatalog,
      maxCustom
    });
  } catch (error) {
    console.error('Error verificando límite global:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const checkCustomOrdersLimit = async (req, res) => {
  try {
    const config = await StoreConfig.findOne();
    
    if (!config) {
      return res.status(200).json({
        success: true,
        canBuy: true,
        canCreate: true,
        currentCustomOrders: 0,
        maxCustomOrders: null,
        remaining: null,
        limitType: 'none',
        message: 'Sin límites configurados - Haz todos los encargos que desees'
      });
    }
    
    // Resetear contadores si han pasado 7 días
    const now = new Date();
    const weekStart = new Date(config.orderLimits.weekStartDate);
    const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 7) {
      config.stockLimits.catalog.currentWeekSales = 0;
      config.stockLimits.customOrders.currentWeekOrders = 0;
      config.orderLimits.weekStartDate = now;
      await config.save();
    }
    
    const currentCatalogSales = config.stockLimits.catalog.currentWeekSales || 0;
    const currentCustomOrders = config.stockLimits.customOrders.currentWeekOrders || 0;
    
    // Determinar tipo de límite y configuración
    const hasGlobalLimit = config.stockLimits?.global?.isLimitActive;
    const hasCustomOrdersLimit = config.stockLimits.customOrders.isLimitActive;
    
    let limitType, maxOrders, currentUsed, message;
    
    if (hasGlobalLimit) {
      // Límite global activo
      limitType = 'global';
      maxOrders = config.stockLimits.global.defaultMaxStock;
      currentUsed = currentCatalogSales + currentCustomOrders;
      message = `Quedan ${maxOrders - currentUsed} pedidos disponibles (catálogo + encargos)`;
      console.log('🌐 Límite global activo (encargos):', {
        maxOrders,
        currentUsed,
        currentCatalogSales,
        currentCustomOrders,
        message
      });
    } else if (hasCustomOrdersLimit) {
      // Límite específico de encargos personalizados
      limitType = 'customOrders';
      maxOrders = config.stockLimits.customOrders.defaultMaxStock || 20;
      currentUsed = currentCustomOrders;
      message = `Quedan ${maxOrders - currentUsed} encargos personalizados disponibles`;
    } else {
      // Sin límites
      limitType = 'none';
      maxOrders = null;
      currentUsed = 0;
      message = 'Sin límites - Haz todos los encargos que desees';
    }
    
    const canCreate = limitType === 'none' || currentUsed < maxOrders;
    
    res.status(200).json({
      success: true,
      canBuy: canCreate,
      canCreate,
      currentCustomOrders: currentUsed,
      maxCustomOrders: maxOrders,
      remaining: maxOrders ? Math.max(0, maxOrders - currentUsed) : null,
      limitType,
      message,
      isGlobalLimit: hasGlobalLimit,
      catalogSales: currentCatalogSales,
      customOrders: currentCustomOrders,
      totalOrders: currentCatalogSales + currentCustomOrders
    });
  } catch (error) {
    console.error('Error verificando límite de encargos personalizados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Verificar límite global del catálogo
 */
export const checkCatalogLimit = async (req, res) => {
  try {
    console.log('🔍 Verificando límite del catálogo...');
    const config = await StoreConfig.findOne();
    
    if (!config) {
      console.log('⚠️ No hay configuración en la base de datos');
      return res.status(200).json({
        success: true,
        canBuy: true,
        currentCatalogSales: 0,
        maxCatalogOrders: null,
        remaining: null,
        limitType: 'none',
        message: 'Sin límites configurados - Compra lo que desees'
      });
    }
    
    // Resetear contadores si han pasado 7 días
    const now = new Date();
    const weekStart = new Date(config.orderLimits.weekStartDate);
    const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 7) {
      config.stockLimits.catalog.currentWeekSales = 0;
      config.stockLimits.customOrders.currentWeekOrders = 0;
      config.orderLimits.weekStartDate = now;
      await config.save();
    }
    
    const currentCatalogSales = config.stockLimits.catalog.currentWeekSales || 0;
    const currentCustomOrders = config.stockLimits.customOrders.currentWeekOrders || 0;
    
    // Determinar tipo de límite y configuración
    const hasGlobalLimit = config.stockLimits?.global?.isLimitActive;
    const hasCatalogLimit = config.stockLimits.catalog.isLimitActive;
    
    console.log('📊 Estado de límites:');
    console.log('- Global limit:', hasGlobalLimit, config.stockLimits?.global);
    console.log('- Catalog limit:', hasCatalogLimit, config.stockLimits.catalog);
    
    let limitType, maxOrders, currentUsed, message;
    
    if (hasGlobalLimit) {
      // Límite global activo
      limitType = 'global';
      maxOrders = config.stockLimits.global.defaultMaxStock;
      currentUsed = currentCatalogSales + currentCustomOrders;
      message = `Quedan ${maxOrders - currentUsed} pedidos disponibles (catálogo + encargos)`;
      console.log('🌐 Límite global activo:', {
        maxOrders,
        currentUsed,
        currentCatalogSales,
        currentCustomOrders,
        message
      });
    } else if (hasCatalogLimit) {
      // Límite específico del catálogo
      limitType = 'catalog';
      maxOrders = config.stockLimits.catalog.defaultMaxStock || 10;
      currentUsed = currentCatalogSales;
      message = `Quedan ${maxOrders - currentUsed} productos del catálogo disponibles`;
    } else {
      // Sin límites
      limitType = 'none';
      maxOrders = null;
      currentUsed = 0;
      message = 'Sin límites - Compra lo que desees';
    }
    
    const canBuy = limitType === 'none' || currentUsed < maxOrders;
    
    const response = {
      success: true,
      canBuy,
      currentCatalogSales: currentUsed,
      maxCatalogOrders: maxOrders,
      remaining: maxOrders ? Math.max(0, maxOrders - currentUsed) : null,
      limitType,
      message,
      isGlobalLimit: hasGlobalLimit,
      catalogSales: currentCatalogSales,
      customOrders: currentCustomOrders,
      totalOrders: currentCatalogSales + currentCustomOrders
    };
    
    console.log('📤 Respuesta del límite del catálogo:', response);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error verificando límite del catálogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
