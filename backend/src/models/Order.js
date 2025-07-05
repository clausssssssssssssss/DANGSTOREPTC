// src/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Asegúrate de tener un modelo 'Customer'
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Asegúrate de tener un modelo 'Product'
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    }
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pendiente', 'procesado', 'enviado', 'cancelado', 'entregado'],
    default: 'pendiente',
  },
}, {
  timestamps: true, // Para habilitar createdAt y updatedAt
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
