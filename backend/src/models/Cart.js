import { Schema, model, Types } from 'mongoose';

/**
 * Esquema de datos para el carrito de compras.
 * Representa los items y estado de un carrito asignado a un cliente.
 */
const cartSchema = new Schema({
  /** Cliente propietario del carrito */
  user: { type: Types.ObjectId, ref: 'Customer', required: true, unique: true },

  /** Productos estándar en el carrito */
  products: [
    {
      product: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],

  /** Productos personalizados en el carrito */
  customizedProducts: [
    {
      item: { type: Types.ObjectId, ref: 'CustomizedOrder', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],

  /** Estado del carrito */
  state: {
    type: String,
    enum: ['Pendiente', 'Pagado', 'Cancelado'],
    default: 'Pendiente'
  },

  /** Punto de entrega seleccionado */
  deliveryPoint: { type: String },

  /** Método de pago elegido */
 paymentMethod: {
    type:    String,
    enum:    ['PayPal', 'Tarjeta', 'Efectivo'],  // ← aquí ahora sí 'PayPal'
    default: 'PayPal'
  }
}, {
  timestamps: true
});

export default model('Cart', cartSchema);