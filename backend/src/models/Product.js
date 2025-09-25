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
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);