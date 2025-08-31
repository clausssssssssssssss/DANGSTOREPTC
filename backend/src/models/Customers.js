import { Schema, model } from "mongoose";

/**
 * Esquema de datos para el modelo Customer.
 * Define la estructura de los documentos de clientes en MongoDB.
 */
const customerSchema = new Schema({
  /** Nombre completo del cliente */
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },

  /** Correo electrónico único y en minúsculas */
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: false,
  },

  /** Contraseña en formato hash, mínimo 6 caracteres */
  password: {
    type: String,
    required: true,
    minLength: 6,
    select: false,
  },

  /** Número de teléfono único del cliente */
  telephone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  /** Dirección del cliente */
  address: {
    type: String,
    trim: true,
    maxLength: 500,
  },

  /** Indica si el email ha sido verificado */
  isVerified: {
    type: Boolean,
    default: false,
  },

  loginAttempts:{
    type:Number,
    default: 0
  },
  locktime:{
    type:Date,
    default: null
  },

  /** Código de recuperación de contraseña */
  resetCode: {
    code: {
      type: String,
      select: false, // No incluir por defecto en consultas
    },
    expires: {
      type: Date,
      select: false, // No incluir por defecto en consultas
    }
  },

  /** Lista de productos favoritos */
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    }
  ],

  /** Lista de órdenes realizadas por el cliente (opcional) */
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    }
  ],

}, {
  // Agrega campos createdAt y updatedAt automáticamente
  timestamps: true,
});

/**
 * Modelo de Mongoose para colecciones de clientes.
 */
export default model("Customer", customerSchema);
