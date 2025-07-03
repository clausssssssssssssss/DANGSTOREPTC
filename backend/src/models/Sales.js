/**
 * Modelo Mongoose para la colección de ventas.
 * @module models/Sale
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

/**
 * Esquema para una venta.
 * @typedef {Object} Sale
 * @property {mongoose.Types.ObjectId} id_carShopping - Referencia al carrito de compras.
 * @property {String} state - Estado de la venta. Valores permitidos: 'Pendiente', 'Completada', 'Cancelada'.
 * @property {String} deliveryPoint - Punto de entrega (dirección o zona).
 * @property {String} paymentMethod - Método de pago utilizado (por ejemplo: 'Tarjeta', 'Efectivo').
 */
const SaleSchema = new Schema(
  {
    id_carShopping: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: [true, 'El campo id_carShopping es obligatorio']
    },
    state: {
      type: String,
      enum: ['Pendiente', 'Completada', 'Cancelada'],
      default: 'Pendiente'
    },
    deliveryPoint: {
      type: String,
      required: [true, 'El campo deliveryPoint es obligatorio'],
      trim: true
    },
    paymentMethod: {
      type: String,
      required: [true, 'El campo paymentMethod es obligatorio'],
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sales'
  }
);

module.exports = model('Sale', SaleSchema);
