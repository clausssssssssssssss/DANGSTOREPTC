import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxLength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del producto es obligatoria'],
    maxLength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio del producto es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  disponibles: {
    type: Number,
    required: [true, 'La cantidad disponible es obligatoria'],
    min: [0, 'La cantidad disponible no puede ser negativa']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría del producto es obligatoria'],
    trim: true
  },
  imagen: {
    type: String,
    default: null
  },
  // Campos para productos que provienen de encargos personalizados
  isFromCustomOrder: {
    type: Boolean,
    default: false
  },
  originalCustomOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomizedOrder',
    default: null
  },
  originalCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  // Límites de stock
  stockLimits: {
    maxStock: {
      type: Number,
      default: null // null significa usar el límite por defecto de la tienda
    },
    isStockLimitActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Método para verificar si hay stock disponible
productSchema.methods.hasStockAvailable = function(quantity = 1) {
  if (!this.stockLimits.isStockLimitActive) return true;
  return this.disponibles >= quantity;
};

// Método para obtener el límite de stock efectivo
productSchema.methods.getEffectiveStockLimit = function(storeConfig) {
  if (!this.stockLimits.isStockLimitActive) return null;
  return this.stockLimits.maxStock || storeConfig.stockLimits.defaultMaxStock;
};

export default mongoose.model('Product', productSchema);