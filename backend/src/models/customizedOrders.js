import { Schema, model, Types } from 'mongoose';

/**
 * Esquema de datos para el modelo CustomizedOrder.
 * Define la estructura de los documentos de pedidos personalizados en MongoDB.
 */
const customizedOrderSchema = new Schema(
  {
    /** Referencia al cliente que realiza el pedido */
    user: {
      type: Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    /** URL de la imagen proporcionada para el pedido personalizado */
    imageUrl: {
      type: String,
      required: true,
    },

    /** Tipo de modelo solicitado: cuadro_chico, llavero o cuadro_grande */
    modelType: {
      type: String,
      enum: ['cuadro_chico', 'llavero', 'cuadro_grande'],
      required: true,
    },

    /** Descripción adicional del pedido (opcional) */
    description: {
      type: String,
    },

    /** Estado del pedido */
    status: {
      type: String,
      enum: ['pending', 'quoted', 'accepted', 'rejected'],
      default: 'pending',
    },

    /** Precio cotizado o final del pedido */
    price: {
      type: Number,
    },

    /** Comentarios internos o adicionales sobre el pedido */
    comment: {
      type: String,
    },
  },
  {
    // Agrega campos createdAt y updatedAt automáticamente
    timestamps: true,
  }
);

/**
 * Modelo de Mongoose para colecciones de pedidos personalizados.
 */
export default model('CustomizedOrder', customizedOrderSchema);
