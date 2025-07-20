import { Schema, model } from "mongoose";

/**
 * Esquema de datos para el modelo Sale.
 * Define la estructura de los documentos de ventas en MongoDB.
 */
const saleSchema = new Schema(
  {
    /**
     * Lista de productos incluidos en la venta.
     * Cada elemento es una referencia a un documento de Product.
     */
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],

    /**
     * Nombre o identificador del cliente que realiza la compra.
     */
    customer: {
      type: String,
      required: true,
    },

    /**
     * Monto total de la venta.
     */
    total: {
      type: Number,
      required: true,
    },

    /**
     * Fecha en que se registra la venta.
     * Por defecto es la fecha y hora actual.
     */
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Agrega campos createdAt y updatedAt automáticamente
    timestamps: true,
    // Permite almacenar campos adicionales no definidos en el esquema
    strict: false,
  }
);

/**
 * Modelo de Mongoose para colecciones de ventas.
 */
export default model("Sale", saleSchema);
