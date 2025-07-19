import { Schema, model } from "mongoose";

// Esquema para administradores
const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
  }
);

export default model("Admin", adminSchema);
