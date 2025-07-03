/**
 * Modelo Mongoose para la colección de calificaciones de productos.
 * @module models/Rating
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

/**
 * Esquema para una calificación (rating) de un producto por parte de un cliente.
 * @typedef {Object} Rating
 * @property {mongoose.Types.ObjectId} id_product - Referencia al producto calificado.
 * @property {mongoose.Types.ObjectId} id_customer - Referencia al cliente que realiza la calificación.
 * @property {String} [comment] - Comentario opcional del cliente.
 * @property {Number} rating - Calificación numérica (por ejemplo: 1 a 5).
 * @property {Date} createdAt - Fecha de creación del documento.
 * @property {Date} updatedAt - Fecha de última actualización del documento.
 */
const RatingSchema = new Schema(
  {
    id_product: {
      type: Schema.Types.ObjectId,
      ref: 'CustomizedProduct',
      required: [true, 'El campo id_product es obligatorio']
    },
    id_customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'El campo id_customer es obligatorio']
    },
    comment: {
      type: String,
      default: '',
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'El campo rating es obligatorio'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'ratings'
  }
);

module.exports = model('Rating', RatingSchema);
