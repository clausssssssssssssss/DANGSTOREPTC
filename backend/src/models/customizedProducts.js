/**
 * Modelo Mongoose para la colección de productos personalizados.
 * @module models/customizedProduct
 */
// backend/src/models/customizedProducts.js
import { Schema, model } from 'mongoose';

/**
 * Esquema para un producto personalizado.
 * @typedef {Object} customizedProduct
 * @property {String} imagen - Nombre o ruta del archivo de imagen (por ejemplo: 'foto1.png').
 * @property {String} [descripcion] - Breve descripción de la imagen.
 * @property {Number} cotizacion - Valor numérico de la cotización asociada. Debe ser un entero >= 0.
 * @property {String} status - Estado de la cotización. Valores permitidos: 'pendiente', 'aceptado', 'rechazado'.
 * @property {String} [comentario] - Comentarios adicionales o motivos de aceptación/rechazo.
 * @property {Date} createdAt - Fecha de creación del documento.
 * @property {Date} updatedAt - Fecha de última actualización del documento.
 */
const CustomizedProductSchema = new Schema(
  {
    /**
     * Nombre del archivo de imagen.
     */
    imagen: {
      type: String,
      required: [true, 'El campo imagen es obligatorio'],
      trim: true
    },

    /**
     * Descripción de la imagen.
     */
    descripcion: {
      type: String,
      default: '',
      trim: true
    },

    /**
     * Cotización asociada.
     */
    cotizacion: {
      type: Number,
      required: [true, 'El campo cotizacion es obligatorio'],
      min: [0, 'La cotizacion no puede ser negativa']
    },

    /**
     * Estado de la cotización.
     */
    status: {
      type: String,
      enum: {
        values: ['pendiente', 'aceptado', 'rechazado'],
        message: 'El estado debe ser pendiente, aceptado o rechazado'
      },
      default: 'pendiente'
    },

    /**
     * Comentarios adicionales.
     */
    comentario: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'customizedProducts'
  }
);

// Exporta el modelo bajo el nombre 'CustomizedProduct' y lo asocia a la colección 'customizedProducts'.
export default model('CustomizedProduct', CustomizedProductSchema);

