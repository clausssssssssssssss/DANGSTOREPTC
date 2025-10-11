import mongoose from 'mongoose';

const deliveryPointSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  departamento: {
    type: String,
    required: true,
    default: 'San Salvador',
    enum: ['San Salvador']
  },
  coordenadas: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  activo: {
    type: Boolean,
    default: true
  },
  descripcion: {
    type: String,
    trim: true,
    default: ''
  },
  referencia: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
deliveryPointSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para búsquedas eficientes
deliveryPointSchema.index({ activo: 1 });
deliveryPointSchema.index({ departamento: 1, activo: 1 });
deliveryPointSchema.index({ 'coordenadas.lat': 1, 'coordenadas.lng': 1 });

export default mongoose.model('DeliveryPoint', deliveryPointSchema);

