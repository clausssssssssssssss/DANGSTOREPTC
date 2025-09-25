import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxLength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción del producto es obligatoria'],
    maxLength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio del producto es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'La cantidad disponible es obligatoria'],
    min: [0, 'La cantidad disponible no puede ser negativa']
  },
  category: {
    type: String,
    required: [true, 'La categoría del producto es obligatoria'],
    trim: true
  },
  images: {
    type: [String], // Array de strings para múltiples imágenes
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);