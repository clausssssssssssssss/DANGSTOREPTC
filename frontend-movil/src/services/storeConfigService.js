import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

class StoreConfigService {
  // Obtener configuración de la tienda
  async getStoreConfig() {
    try {
      const token = await this.getAuthToken();
      console.log('Token obtenido:', token ? 'Token presente' : 'Sin token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      const response = await fetch(`${API_URL}/store-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        console.error('Error obteniendo configuración de tienda:', response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Configuración obtenida del servidor:', data);
      return data;
    } catch (error) {
      console.error('Error obteniendo configuración de tienda:', error);
      throw error; // Re-lanzar el error para que se maneje en el componente
    }
  }

  // Configuración por defecto
  getDefaultStoreConfig() {
    return {
      success: true,
      data: {
        stockLimits: {
          isStockLimitActive: true,
          catalog: {
            defaultMaxStock: 10,
            isLimitActive: true
          },
          customOrders: {
            defaultMaxStock: 20,
            isLimitActive: true
          },
          defaultMaxStock: 10,
          lowStockThreshold: 5
        },
        notifications: {
          lowStockEnabled: true,
          orderLimitReachedEnabled: true
        },
        isStoreActive: true
      }
    };
  }

  // Actualizar configuración de la tienda
  async updateStoreConfig(configData) {
    try {
      const token = await this.getAuthToken();
      console.log('Token para actualización:', token ? 'Token presente' : 'Sin token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      console.log('Enviando configuración al servidor:', configData);
      const response = await fetch(`${API_URL}/store-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configData)
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        console.error('Error actualizando configuración de tienda:', response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Configuración actualizada en el servidor:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando configuración de tienda:', error);
      throw error; // Re-lanzar el error para que se maneje en el componente
    }
  }

  // Verificar si se pueden aceptar más pedidos
  async canAcceptOrders() {
    try {
      const response = await fetch(`${API_URL}/store-config/can-accept-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Error verificando límites de pedidos, usando configuración por defecto');
        return this.getDefaultOrderLimits();
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando límites de pedidos:', error);
      return this.getDefaultOrderLimits();
    }
  }

  // Límites de pedidos por defecto
  getDefaultOrderLimits() {
    return {
      success: true,
      canAccept: true,
      remainingOrders: 15,
      currentWeekOrders: 0,
      weeklyMaxOrders: 15
    };
  }

  // Verificar stock de un producto
  async checkProductStock(productId, quantity = 1) {
    try {
      const response = await fetch(`${API_URL}/store-config/product-stock/${productId}/${quantity}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Error verificando stock de producto, usando datos por defecto');
        return this.getDefaultStockInfo(productId, quantity);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando stock de producto:', error);
      return this.getDefaultStockInfo(productId, quantity);
    }
  }

  // Información de stock por defecto
  getDefaultStockInfo(productId, quantity) {
    return {
      success: true,
      hasStock: true,
      available: 10,
      requested: quantity,
      effectiveLimit: 10
    };
  }

  // Actualizar límites de stock de un producto
  async updateProductStockLimits(productId, stockLimits) {
    try {
      const response = await fetch(`${API_URL}/store-config/product-stock/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(stockLimits)
      });

      if (!response.ok) {
        console.log('Error actualizando límites de stock, simulando actualización');
        return {
          success: true,
          message: 'Límites de stock actualizados (modo offline)',
          data: stockLimits
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando límites de stock:', error);
      return {
        success: true,
        message: 'Límites de stock actualizados (modo offline)',
        data: stockLimits
      };
    }
  }

  // Obtener productos con stock bajo
  async getLowStockProducts() {
    try {
      const response = await fetch(`${API_URL}/store-config/low-stock`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo productos con stock bajo:', error);
      throw error;
    }
  }

  // Obtener token de autenticación
  // Método de prueba para verificar autenticación
  async testAuth() {
    try {
      const token = await this.getAuthToken();
      console.log('Token para prueba:', token ? 'Token presente' : 'Sin token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/store-config/test-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta de prueba de auth:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Prueba de autenticación exitosa:', data);
      return data;
    } catch (error) {
      console.error('Error en prueba de autenticación:', error);
      throw error;
    }
  }

  async getAuthToken() {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }
}

export default new StoreConfigService();
