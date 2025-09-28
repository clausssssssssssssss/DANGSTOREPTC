import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    /** Título de la notificación */
    title: {
      type: String,
      required: true,
    },

    /** Mensaje/descripción de la notificación */
    message: {
      type: String,
      required: true,
    },

    /** Tipo de notificación */
    type: {
      type: String,
      enum: ['new_order', 'order_updated', 'payment', 'purchase', 'rating', 'general'],
      default: 'general',
    },

    /** Prioridad de la notificación */
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },

    /** Si ha sido leída */
    isRead: {
      type: Boolean,
      default: false,
    },

    /** Datos adicionales (ID de orden, etc.) */
    data: {
      orderId: String,
      customerName: String,
      modelType: String,
      price: Number,
      imageUrl: String,
      total: Number,
      itemsCount: Number,
      productId: String,
      productName: String,
      rating: Number,
      comment: String,
    },

    /** Icono para mostrar en la notificación */
    icon: {
      type: String,
      default: '🔔',
    },
  },
  {
    timestamps: true,
  }
);

export default model('Notification', notificationSchema);