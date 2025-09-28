import { useState, useEffect, useCallback } from 'react';
import storeConfigService from '../services/storeConfigService';

export const useStoreLimits = () => {
  const [canAcceptOrders, setCanAcceptOrders] = useState(true);
  const [remainingOrders, setRemainingOrders] = useState(999);
  const [currentWeekOrders, setCurrentWeekOrders] = useState(0);
  const [weeklyMaxOrders, setWeeklyMaxOrders] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar límites de pedidos
  const checkOrderLimits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await storeConfigService.canAcceptOrders();
      
      if (response.success) {
        setCanAcceptOrders(response.canAccept);
        setRemainingOrders(response.remainingOrders || 0);
        setCurrentWeekOrders(response.currentWeekOrders || 0);
        setWeeklyMaxOrders(response.weeklyMaxOrders || 15);
      } else {
        setError('Error verificando límites de pedidos');
      }
    } catch (err) {
      console.error('Error checking order limits:', err);
      setError('Error de conexión al verificar límites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar stock de un producto
  const checkProductStock = useCallback(async (productId, quantity = 1) => {
    try {
      const response = await storeConfigService.checkProductStock(productId, quantity);
      return response;
    } catch (err) {
      console.error('Error checking product stock:', err);
      return { success: false, hasStock: false, error: err.message };
    }
  }, []);

  // Verificar stock de múltiples productos
  const checkMultipleProductsStock = useCallback(async (products) => {
    try {
      const response = await storeConfigService.checkMultipleProductsStock(products);
      return response;
    } catch (err) {
      console.error('Error checking multiple products stock:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Cargar límites al montar el componente
  useEffect(() => {
    checkOrderLimits();
  }, [checkOrderLimits]);

  // Obtener mensaje de límite de pedidos alcanzado
  const getOrderLimitMessage = () => {
    if (canAcceptOrders) return null;
    
    return {
      title: 'Límite de Pedidos Alcanzado',
      message: `Lo sentimos, hemos alcanzado el límite máximo de ${weeklyMaxOrders} pedidos semanales. Por favor, intenta nuevamente la próxima semana.`,
      type: 'order_limit'
    };
  };

  // Obtener mensaje de stock insuficiente
  const getStockLimitMessage = (productName, available, requested) => {
    return {
      title: 'Stock Insuficiente',
      message: `Lo sentimos, no hay suficiente stock disponible para "${productName}". Solo quedan ${available} unidades.`,
      type: 'stock_limit',
      productName,
      available,
      requested
    };
  };

  return {
    // Estado
    canAcceptOrders,
    remainingOrders,
    currentWeekOrders,
    weeklyMaxOrders,
    loading,
    error,
    
    // Funciones
    checkOrderLimits,
    checkProductStock,
    checkMultipleProductsStock,
    getOrderLimitMessage,
    getStockLimitMessage,
    
    // Utilidades
    isOrderLimitReached: !canAcceptOrders,
    hasRemainingOrders: remainingOrders > 0
  };
};

export default useStoreLimits;
