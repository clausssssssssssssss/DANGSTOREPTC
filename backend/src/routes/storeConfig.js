import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getStoreConfig,
  updateStoreConfig,
  canAcceptOrders,
  checkCatalogLimit,
  checkCustomOrdersLimit,
  checkGlobalLimit,
  checkProductStock,
  updateProductStockLimits,
  getLowStockProducts
} from '../controllers/storeConfigController.js';

const router = Router();

// Ruta de prueba para verificar autenticación
router.get(
  '/test-auth',
  authMiddleware(['admin']),
  (req, res) => {
    res.json({ 
      success: true, 
      message: 'Autenticación exitosa',
      user: req.user 
    });
  }
);

// Obtener configuración de la tienda
router.get(
  '/',
  authMiddleware(['admin']),
  getStoreConfig
);

// Actualizar configuración de la tienda
router.put(
  '/',
  authMiddleware(['admin']),
  updateStoreConfig
);

// Verificar si se pueden aceptar más pedidos (público)
router.get(
  '/can-accept-orders',
  canAcceptOrders
);

// Esta ruta no es necesaria ya que el incremento se hace automáticamente en cartController

// Verificar límite global del catálogo (público)
router.get(
  '/catalog-limit',
  checkCatalogLimit
);

// Verificar límite de encargos personalizados (público)
router.get(
  '/custom-orders-limit',
  checkCustomOrdersLimit
);

// Verificar límite global (catálogo + encargos) (público)
router.get(
  '/global-limit',
  checkGlobalLimit
);

// Verificar stock disponible para un producto (público)
router.get(
  '/product-stock/:productId/:quantity?',
  checkProductStock
);

// Actualizar límites de stock de un producto
router.put(
  '/product-stock/:productId',
  authMiddleware(['admin']),
  updateProductStockLimits
);

// Obtener productos con stock bajo
router.get(
  '/low-stock',
  authMiddleware(['admin']),
  getLowStockProducts
);

export default router;
