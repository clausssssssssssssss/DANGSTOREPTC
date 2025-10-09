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

    /** Punto de entrega seleccionado */
    deliveryPoint: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryPoint",
      required: false,
    },

    /** Estado de la entrega: PAID, SCHEDULED, CONFIRMED, READY_FOR_DELIVERY, DELIVERED, CANCELLED */
    deliveryStatus: {
      type: String,
      enum: ["PAID", "SCHEDULED", "CONFIRMED", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PAID",
    },

    /** Fecha y hora programada para la entrega */
    deliveryDate: {
      type: Date,
      required: false,
    },

    /** Fecha y hora propuesta por el cliente para reprogramación */
    proposedDeliveryDate: {
      type: Date,
      required: false,
    },

    /** Razón para solicitar reprogramación */
    reschedulingReason: {
      type: String,
      required: false,
    },

    /** Estado de la reprogramación: NONE, REQUESTED, APPROVED, REJECTED */
    reschedulingStatus: {
      type: String,
      enum: ["NONE", "REQUESTED", "APPROVED", "REJECTED"],
      default: "NONE",
    },

    /** Indica si el cliente confirmó la entrega programada */
    deliveryConfirmed: {
      type: Boolean,
      default: false,
    },

    /** Historial de cambios de estado */
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedBy: {
          type: String, // 'customer' o 'admin'
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

/**
 * Modelo de Mongoose para colecciones de órdenes.
 */
export default model("Order", orderSchema);
