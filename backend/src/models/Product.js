import { Schema, model } from "mongoose";

/**
 * Esquema de datos para el modelo Product.
 * Define la estructura de los documentos de productos en MongoDB.
 */
const productSchema = new Schema(
  {
    /** Nombre del producto */
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },

    /** Precio del producto (>= 0) */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /** Cantidad en inventario (>= 0), por defecto 0 */
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    /** Descripción del producto, hasta 1000 caracteres */
    description: {
      type: String,
      required: false,
      maxLength: 1000,
    },

    /** Categoría del producto */
    category: {
      type: String,
      required: true,
      trim: true,
    },

    /** URLs de las imágenes del producto */
    images: [
      {
        type: String,
        required: false,
      },
    ],
  },
  {
    // Agrega campos createdAt y updatedAt automáticamente
    timestamps: true,
    // Permite campos adicionales que no estén definidos en el esquema
    strict: false,
  }
);

/**
 * Modelo de Mongoose para colecciones de productos.
 */
export default model("Product", productSchema);
