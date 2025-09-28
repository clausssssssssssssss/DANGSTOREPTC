import mongoose from 'mongoose';

const storeConfigSchema = new mongoose.Schema({
  // Límites de pedidos
  orderLimits: {
    weeklyMaxOrders: {
      type: Number,
      default: 15,
      min: 1
    },
    currentWeekOrders: {
      type: Number,
      default: 0
    },
    weekStartDate: {
      type: Date,
      default: Date.now
    },
    isOrderLimitActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Límites de stock por producto
  stockLimits: {
    isStockLimitActive: {
      type: Boolean,
      default: true
    },
    // Límites separados por tipo de producto
    catalog: {
      defaultMaxStock: {
        type: Number,
        default: 10,
        min: 1
      },
      isLimitActive: {
        type: Boolean,
        default: true
      }
    },
    customOrders: {
      defaultMaxStock: {
        type: Number,
        default: 20,
        min: 1
      },
      isLimitActive: {
        type: Boolean,
        default: true
      }
    },
    // Límite global (para compatibilidad)
    defaultMaxStock: {
      type: Number,
      default: 10,
      min: 1
    }
  },
  
  // Configuración general
  isStoreActive: {
    type: Boolean,
    default: true
  },
  
  // Notificaciones
  notifications: {
    lowStockEnabled: {
      type: Boolean,
      default: true
    },
    orderLimitEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Método para verificar si se pueden aceptar más pedidos
storeConfigSchema.methods.canAcceptOrders = function() {
  if (!this.isStoreActive) return false;
  if (!this.orderLimits.isOrderLimitActive) return true;
  
  const now = new Date();
  const weekStart = new Date(this.orderLimits.weekStartDate);
  const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
  
  // Si han pasado más de 7 días, resetear el contador
  if (daysDiff >= 7) {
    this.orderLimits.currentWeekOrders = 0;
    this.orderLimits.weekStartDate = now;
    this.save();
  }
  
  return this.orderLimits.currentWeekOrders < this.orderLimits.weeklyMaxOrders;
};

// Método para incrementar contador de pedidos
storeConfigSchema.methods.incrementOrderCount = function() {
  const now = new Date();
  const weekStart = new Date(this.orderLimits.weekStartDate);
  const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
  
  // Si han pasado más de 7 días, resetear el contador
  if (daysDiff >= 7) {
    this.orderLimits.currentWeekOrders = 1;
    this.orderLimits.weekStartDate = now;
  } else {
    this.orderLimits.currentWeekOrders += 1;
  }
  
  return this.save();
};

// Método para obtener límite de stock de un producto
storeConfigSchema.methods.getProductStockLimit = function(productId) {
  // Por ahora retornamos el límite por defecto
  // En el futuro se puede personalizar por producto
  return this.stockLimits.defaultMaxStock;
};

const StoreConfig = mongoose.model('StoreConfig', storeConfigSchema);

export default StoreConfig;
