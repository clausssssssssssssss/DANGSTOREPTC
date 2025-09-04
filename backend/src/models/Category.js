import mongoose from "mongoose";

// Definimos el esquema para las categorías
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de la categoría es obligatorio"],
    trim: true,
    unique: true, // Evita duplicados
    maxLength: [50, "El nombre no puede exceder los 50 caracteres"]
  },
  description: {
    type: String,
    trim: true,
    maxLength: [200, "La descripción no puede exceder los 200 caracteres"]
  }
}, {
  timestamps: true // Crea campos automáticos createdAt y updatedAt
});

export default mongoose.model("Category", categorySchema);
