import mongoose from "mongoose";

// Definimos el esquema para las categorías
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de la categoría es obligatorio"],
    trim: true,
    unique: true,
    maxLength: [50, "El nombre no puede exceder los 50 caracteres"]
  }
}, {
  timestamps: true
});

export default mongoose.model("Category", categorySchema);
