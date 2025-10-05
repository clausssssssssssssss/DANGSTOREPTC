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
    
    let config = await StoreConfig.findOne();
    
    if (!config) {
      config = new StoreConfig();
    }
    
    // Actualizar límites de pedidos
    if (orderLimits) {
      config.orderLimits = { ...config.orderLimits, ...orderLimits };
    }
    
    // Actualizar límites de stock
    if (stockLimits) {
      config.stockLimits = { ...config.stockLimits, ...stockLimits };
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
        maxCustomOrders: 50, // Límite global por defecto
        remaining: 50,
        message: 'No hay límites configurados para encargos personalizados'
      });
    }
    
    // Usar límite global si está configurado, sino usar límite específico de encargos
    const hasGlobalLimit = config.stockLimits?.global?.isLimitActive;
    const maxOrders = hasGlobalLimit 
      ? (config.stockLimits.global.defaultMaxStock || 50)
      : (config.stockLimits.customOrders.defaultMaxStock || 20);
    
    // Verificar si algún límite está activo
    const hasActiveLimit = hasGlobalLimit || config.stockLimits.customOrders.isLimitActive;
    
    if (!hasActiveLimit) {
      return res.status(200).json({
        success: true,
        canBuy: true,
        canCreate: true,
        currentCustomOrders: 0,
        maxCustomOrders: maxOrders,
        remaining: maxOrders,
        message: 'Límite de encargos personalizados desactivado'
      });
    }
    
    // Contar encargos personalizados en la semana actual
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
    
    const currentCatalogSales = config.stockLimits.catalog.currentWeekSales || 0;
    const currentCustomOrders = config.stockLimits.customOrders.currentWeekOrders || 0;
    
    // Si hay límite global, usar total combinado
    const currentTotal = hasGlobalLimit ? (currentCatalogSales + currentCustomOrders) : currentCustomOrders;
    const canCreate = currentTotal < maxOrders;
    
    res.status(200).json({
      success: true,
      canBuy: canCreate, // Cambiar canCreate por canBuy para consistencia
      canCreate,
      currentCustomOrders: currentTotal, // Mostrar total si es global
      maxCustomOrders: maxOrders,
      remaining: Math.max(0, maxOrders - currentTotal),
      isGlobalLimit: hasGlobalLimit
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
    const config = await StoreConfig.findOne();
    
    if (!config) {
      return res.status(200).json({
        success: true,
        canBuy: true,
        currentCatalogSales: 0,
        maxCatalogOrders: 50, // Límite global por defecto
        remaining: 50,
        message: 'No hay límites configurados para el catálogo'
      });
    }
    
    // Usar límite global si está configurado, sino usar límite específico del catálogo
    const hasGlobalLimit = config.stockLimits?.global?.isLimitActive;
    const maxOrders = hasGlobalLimit 
      ? (config.stockLimits.global.defaultMaxStock || 50)
      : (config.stockLimits.catalog.defaultMaxStock || 10);
    
    // Verificar si algún límite está activo
    const hasActiveLimit = hasGlobalLimit || config.stockLimits.catalog.isLimitActive;
    
    if (!hasActiveLimit) {
      return res.status(200).json({
        success: true,
        canBuy: true,
        currentCatalogSales: 0,
        maxCatalogOrders: maxOrders,
        remaining: maxOrders,
        message: 'Límite del catálogo desactivado'
      });
    }
    
    // Contar productos vendidos del catálogo en la semana actual
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
    
    const currentCatalogSales = config.stockLimits.catalog.currentWeekSales || 0;
    const currentCustomOrders = config.stockLimits.customOrders.currentWeekOrders || 0;
    
    // Si hay límite global, usar total combinado
    const currentTotal = hasGlobalLimit ? (currentCatalogSales + currentCustomOrders) : currentCatalogSales;
    const canBuy = currentTotal < maxOrders;
    
    res.status(200).json({
      success: true,
      canBuy,
      currentCatalogSales: currentTotal, // Mostrar total si es global
      maxCatalogOrders: maxOrders,
      remaining: Math.max(0, maxOrders - currentTotal),
      isGlobalLimit: hasGlobalLimit
    });
  } catch (error) {
    console.error('Error verificando límite del catálogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
