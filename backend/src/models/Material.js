import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
import cloudinary from 'cloudinary';

// Esquema para un material en inventario
const MaterialSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El campo name es obligatorio'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'El campo type es obligatorio'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'El campo quantity es obligatorio'],
      min: [0, 'La cantidad no puede ser negativa']
    },
    dateOfEntry: {
      type: Date,
      required: [true, 'El campo dateOfEntry es obligatorio']
    },
    investment: {
      type: Number,
      required: [true, 'El campo investment es obligatorio'],
      min: [0, 'La inversión no puede ser negativa']
    },
    image: {
      type: String,  // Aquí almacenaremos la URL de la imagen
      required: [true, 'La imagen es obligatoria']
    }
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Elimina el campo __v
    collection: 'materials' // Nombre explícito de la colección
  }
);

export default model('Material', MaterialSchema);
