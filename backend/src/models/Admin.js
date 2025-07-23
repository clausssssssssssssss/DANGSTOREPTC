import { Schema, model } from "mongoose";

/**
 * Esquema de datos para el modelo Admin.
 * Define la estructura de los documentos de administradores en MongoDB.
 */
const adminSchema = new Schema(
  {
    /** Nombre completo del administrador */
    name: {
      type: String,
      required: true,
    },

    /** Correo electrónico único del administrador */
    email: {
      type: String,
      required: true,
      unique: true,
    },

    /** Contraseña del administrador en formato hash */
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Agrega campos createdAt y updatedAt automáticamente
    timestamps: true,
  }
);

/**
 * Modelo de Mongoose para colecciones de administradores.
 */
export default model("Admin", adminSchema);
