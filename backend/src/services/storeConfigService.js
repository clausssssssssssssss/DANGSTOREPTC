import StoreConfig from '../models/StoreConfig.js';

/**
 * Servicio para manejar la configuración de la tienda
 */
class StoreConfigService {
  
  /**
   * Obtener la configuración de la tienda
   */
  static async getStoreConfig() {
    try {
      let config = await StoreConfig.findOne();
      
      if (!config) {
        // Crear configuración por defecto si no existe
        config = new StoreConfig({
          stockLimits: {
            isStockLimitActive: true,
            global: {
              defaultMaxStock: 50,
              isLimitActive: true,
            },
            catalog: {
              defaultMaxStock: 10,
              isLimitActive: true,
              currentWeekSales: 0,
            },
            customOrders: {
              defaultMaxStock: 20,
              isLimitActive: true,
              currentWeekOrders: 0,
            },
            defaultMaxStock: 10,
            lowStockThreshold: 5,
          },
          notifications: {
            lowStockEnabled: true,
            orderLimitReachedEnabled: true,
          },
          orderLimits: {
            weekStartDate: new Date(),
            currentWeekOrders: 0,
          },
          weeklyGoal: 50,
        });
        
        await config.save();
        console.log('✅ Configuración por defecto creada');
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error obteniendo configuración de la tienda:', error);
      throw error;
    }
  }

  /**
   * Actualizar la configuración de la tienda
   */
  static async updateStoreConfig(configData) {
    try {
      let config = await StoreConfig.findOne();
      
      if (!config) {
        config = new StoreConfig(configData);
      } else {
        // Actualizar campos existentes
        Object.keys(configData).forEach(key => {
          if (configData[key] !== undefined) {
            if (typeof configData[key] === 'object' && !Array.isArray(configData[key])) {
              config[key] = { ...config[key], ...configData[key] };
            } else {
              config[key] = configData[key];
            }
          }
        });
      }
      
      const savedConfig = await config.save();
      console.log('✅ Configuración de la tienda actualizada');
      
      return savedConfig;
    } catch (error) {
      console.error('❌ Error actualizando configuración de la tienda:', error);
      throw error;
    }
  }

  /**
   * Verificar si las notificaciones de stock bajo están habilitadas
   */
  static async isLowStockNotificationEnabled() {
    try {
      const config = await this.getStoreConfig();
      return config.notifications?.lowStockEnabled === true;
    } catch (error) {
      console.error('❌ Error verificando notificaciones de stock bajo:', error);
      return false;
    }
  }

  /**
   * Verificar si las notificaciones de límite de pedidos están habilitadas
   */
  static async isOrderLimitNotificationEnabled() {
    try {
      const config = await this.getStoreConfig();
      return config.notifications?.orderLimitReachedEnabled === true;
    } catch (error) {
      console.error('❌ Error verificando notificaciones de límite de pedidos:', error);
      return false;
    }
  }

  /**
   * Obtener el umbral de stock bajo
   */
  static async getLowStockThreshold() {
    try {
      const config = await this.getStoreConfig();
      return config.stockLimits?.lowStockThreshold || 5;
    } catch (error) {
      console.error('❌ Error obteniendo umbral de stock bajo:', error);
      return 5;
    }
  }

  /**
   * Obtener límite de encargos personalizados
   */
  static async getCustomOrdersLimit() {
    try {
      const config = await this.getStoreConfig();
      return config.stockLimits?.customOrders?.defaultMaxStock || 20;
    } catch (error) {
      console.error('❌ Error obteniendo límite de encargos personalizados:', error);
      return 20;
    }
  }

  /**
   * Verificar si el límite de encargos personalizados está activo
   */
  static async isCustomOrdersLimitActive() {
    try {
      const config = await this.getStoreConfig();
      return config.stockLimits?.customOrders?.isLimitActive === true;
    } catch (error) {
      console.error('❌ Error verificando límite de encargos personalizados:', error);
      return false;
    }
  }
}

export default StoreConfigService;
