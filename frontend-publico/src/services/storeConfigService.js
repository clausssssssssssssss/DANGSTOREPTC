const API_URL = 'https://dangstoreptc-production.up.railway.app/api';

class StoreConfigService {
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando límites de pedidos:', error);
      // En caso de error, asumir que se pueden aceptar pedidos
      return { success: true, canAccept: true };
    }
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

      const data = await response.json();
      
      // Si la respuesta no es exitosa (400, 404, 500, etc.), devolver que no hay stock
      if (!response.ok) {
        console.log('checkProductStock: Respuesta no exitosa:', response.status, data);
        return { 
          success: false, 
          hasStock: false, 
          available: data.available || 0,
          message: data.message || 'Error verificando stock'
        };
      }

      // Si la respuesta es exitosa pero indica que no hay stock
      if (!data.success || !data.hasStock) {
        console.log('checkProductStock: Sin stock disponible:', data);
        return { 
          success: false, 
          hasStock: false, 
          available: data.available || 0,
          message: data.message || 'No hay stock disponible'
        };
      }

      console.log('checkProductStock: Stock disponible:', data);
      return data;
    } catch (error) {
      console.error('Error verificando stock de producto:', error);
      // En caso de error, asumir que NO hay stock disponible para ser más seguro
      return { success: false, hasStock: false, available: 0, message: 'Error de conexión' };
    }
  }

  // Verificar múltiples productos a la vez
  async checkMultipleProductsStock(products) {
    try {
      const promises = products.map(product => 
        this.checkProductStock(product.id, product.quantity)
      );
      
      const results = await Promise.all(promises);
      
      return {
        success: true,
        results: results.map((result, index) => ({
          productId: products[index].id,
          productName: products[index].name,
          hasStock: result.hasStock,
          available: result.available,
          requested: products[index].quantity
        }))
      };
    } catch (error) {
      console.error('Error verificando stock de múltiples productos:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar límite global del catálogo
  async checkCatalogLimit() {
    try {
      const response = await fetch(`${API_URL}/store-config/catalog-limit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando límite del catálogo:', error);
      // En caso de error, asumir que se puede comprar
      return { success: true, canBuy: true };
    }
  }

  // Verificar límite de encargos personalizados
  async checkCustomOrdersLimit() {
    try {
      const response = await fetch(`${API_URL}/store-config/custom-orders-limit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando límite de encargos personalizados:', error);
      // En caso de error, asumir que se puede crear
      return { success: true, canCreate: true };
    }
  }

  // Obtener información de límites de la tienda
  async getStoreLimitsInfo() {
    try {
      const response = await fetch(`${API_URL}/store-config/can-accept-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo información de límites:', error);
      return { 
        success: true, 
        canAccept: true, 
        remainingOrders: 999,
        currentWeekOrders: 0,
        weeklyMaxOrders: 15
      };
    }
  }
}

export default new StoreConfigService();
