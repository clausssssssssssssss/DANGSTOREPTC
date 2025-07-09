import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
import cloudinary from 'cloudinary';

// Esquema para un material en inventario
/**
 * @typedef {Object} Material
 * @property {String} name - Nombre del material (por ejemplo: 'Cadena Acero').
 * @property {String} type - Tipo o categoría del material (por ejemplo: 'metal').
 * @property {Number} quantity - Cantidad disponible. Debe ser un número >= 0.
 * @property {Boolean} disponibilidad - Indica si el material está disponible.
 * @property {Date} entrydate - Fecha de entrada al inventario.
 * @property {Number} investment - Costo o inversión por unidad. Debe ser un número >= 0.
 */
const MaterialSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El campo name es obligatorio'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'El campo type es obligatorio'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'El campo quantity es obligatorio'],
      min: [0, 'La cantidad no puede ser negativa']
    },
    dateOfEntry: {
      type: Date,
      required: [true, 'El campo dateOfEntry es obligatorio']
    },
    investment: {
      type: Number,
      required: [true, 'El campo investment es obligatorio'],
      min: [0, 'La inversión no puede ser negativa']
    },
    image: {
      type: String,  // Aquí almacenaremos la URL de la imagen
      required: [true, 'La imagen es obligatoria']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'materials'
  }
);

export default model('Material', MaterialSchema);
