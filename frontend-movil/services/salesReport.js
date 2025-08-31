// services/salesAPI.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base del backend - igual que tus otros servicios
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.11:4000';

// Función helper para hacer peticiones autenticadas (igual que tu patrón)
const authenticatedFetch = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}/api${url}`, {
    ...options,
    headers,
  });
};

// Servicios para ventas siguiendo tu patrón
export const salesAPI = {
  // ==================== CRUD OPERATIONS ====================
  
  // Obtener todas las ventas
  getAllSales: async () => {
    try {
      const response = await authenticatedFetch('/sales');
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },

  // Crear nueva venta
  createSale: async (saleData) => {
    try {
      // Validación básica
      if (!saleData.product || !saleData.category || !saleData.customer || saleData.total < 0) {
        throw new Error('Datos de venta inválidos');
      }

      const response = await authenticatedFetch('/sales', {
        method: 'POST',
        body: JSON.stringify({
          product: saleData.product.trim(),
          category: saleData.category.trim(),
          customer: saleData.customer.trim(),
          total: parseFloat(saleData.total),
        }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  // Actualizar venta existente
  updateSale: async (saleId, saleData) => {
    try {
      if (!saleId) {
        throw new Error('ID de venta requerido');
      }

      const response = await authenticatedFetch(`/sales/${saleId}`, {
        method: 'PUT',
        body: JSON.stringify({
          product: saleData.product?.trim(),
          category: saleData.category?.trim(),
          customer: saleData.customer?.trim(),
          total: parseFloat(saleData.total),
        }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  },

  // Eliminar venta
  deleteSale: async (saleId) => {
    try {
      if (!saleId) {
        throw new Error('ID de venta requerido');
      }

      const response = await authenticatedFetch(`/sales/${saleId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  },

  // ==================== REPORTES ====================

  // Obtener resumen de ventas (diario, mensual, anual)
  getSalesSummary: async () => {
    try {
      const response = await authenticatedFetch('/sales/summary');
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw error;
    }
  },

  // Obtener ventas por categoría
  getSalesByCategory: async () => {
    try {
      const response = await authenticatedFetch('/sales/by-category');
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw error;
    }
  },

  // Obtener ingresos por rango de fechas
  getIncomeByDateRange: async (startDate, endDate) => {
    try {
      if (!startDate || !endDate) {
        throw new Error('Fechas de inicio y fin requeridas');
      }

      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
      });

      const response = await authenticatedFetch(`/sales/income-range?${params}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error fetching income by date range:', error);
      throw error;
    }
  },

  // ==================== MÉTODOS DE UTILIDAD ====================

  // Test de conexión
  testConnection: async () => {
    try {
      const response = await authenticatedFetch('/sales');
      return response.ok;
    } catch (error) {
      console.error('❌ Sales API connection test failed:', error);
      return false;
    }
  },

  // Obtener estadísticas completas para el dashboard
  getDashboardStats: async () => {
    try {
      const [summary, byCategory] = await Promise.all([
        salesAPI.getSalesSummary(),
        salesAPI.getSalesByCategory()
      ]);

      return {
        summary,
        categories: byCategory
      };
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      throw error;
    }
  },

  // Obtener ingresos del último mes (helper para dashboard)
  getLastMonthIncome: async () => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      return await salesAPI.getIncomeByDateRange(
        lastMonth.toISOString().split('T')[0],
        endOfLastMonth.toISOString().split('T')[0]
      );
    } catch (error) {
      console.error('Error fetching last month income:', error);
      throw error;
    }
  },

  // Crear venta de prueba (para testing)
  createTestSale: async () => {
    const testSale = {
      product: 'Producto Test',
      category: 'Electrónicos',
      customer: 'Cliente Prueba',
      total: 150.75
    };
    
    return salesAPI.createSale(testSale);
  },
};

// Export por defecto para compatibilidad
export default salesAPI;