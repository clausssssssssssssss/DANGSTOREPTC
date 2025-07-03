/**
 * Modelo Mongoose para la colección de materiales.
 * @module models/Material
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

/**
 * Esquema para un material en inventario.
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
      min: [0, 'La quantity no puede ser negativa']
    },
    disponibilidad: {
      type: Boolean,
      required: [true, 'El campo disponibilidad es obligatorio']
    },
    entrydate: {
      type: Date,
      required: [true, 'El campo entrydate es obligatorio']
    },
    investment: {
      type: Number,
      required: [true, 'El campo investment es obligatorio'],
      min: [0, 'La inversión no puede ser negativa']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'materials'
  }
);

module.exports = model('Material', MaterialSchema);
