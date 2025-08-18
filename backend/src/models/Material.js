import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
// import cloudinary from 'cloudinary';

/**
 * Esquema de datos para el modelo Material.
 * Define la estructura de los documentos de materiales en MongoDB.
 */
const MaterialSchema = new Schema(
  {
    /** Nombre del material (por ejemplo: 'Cadena Acero') */
    name: {
      type: String,
      required: [true, 'El campo name es obligatorio'],
      trim: true,
    },

    /** Tipo o categoría del material (por ejemplo: 'metal') */
    type: {
      type: String,
      required: [true, 'El campo type es obligatorio'],
      trim: true,
    },

    /** Cantidad disponible. Debe ser un número >= 0 */
    quantity: {
      type: Number,
      required: [true, 'El campo quantity es obligatorio'],
      min: [0, 'La cantidad no puede ser negativa'],
    },

    /** Fecha de entrada al inventario */
    dateOfEntry: {
      type: Date,
      required: [true, 'El campo dateOfEntry es obligatorio'],
    },

    /** Costo o inversión por unidad. Debe ser un número >= 0 */
    investment: {
      type: Number,
      required: [true, 'El campo investment es obligatorio'],
      min: [0, 'La inversión no puede ser negativa'],
    },

    /** URL de la imagen asociada al material */
    image: {
      type: String,
      required: [true, 'La imagen es obligatoria'],
    },
  },
  {
    // Agrega campos createdAt y updatedAt automáticamente
    timestamps: true,
    // Deshabilita el campo __v de versión
    versionKey: false,
    // Nombre de la colección en MongoDB
    collection: 'materials',
  }
);

/**
 * Modelo de Mongoose para colecciones de materiales.
 */
export default model('Material', MaterialSchema);
