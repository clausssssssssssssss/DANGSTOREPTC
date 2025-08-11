import { Schema, model } from "mongoose";

/**
 * Esquema de datos para el modelo Order.
 * Define la estructura de los documentos de órdenes en MongoDB.
 */
const orderSchema = new Schema(
  {
    /** Referencia al cliente que realiza la orden */
    user: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    /** Lista de artículos incluidos en la orden */
    items: [
      {
        /** Referencia al producto ordenado */
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        /** Cantidad del producto ordenado */
        quantity: {
          type: Number,
          required: true,
        },

        /** Precio unitario del producto en el momento de la orden */
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    /** Monto total de la orden */
    total: {
      type: Number,
      required: true,
    },

    /** Estado de la orden: PENDING, COMPLETED o CANCELLED */
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    /** Información de pago a través de wompi */
    wompi: {
      /** Identificador de la orden en wompi */
      orderID: {
        type: String,
        required: false,
      },
      /** Estado de captura del pago en wompi */
      captureStatus: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

/**
 * Modelo de Mongoose para colecciones de órdenes.
 */
export default model("Order", orderSchema);
