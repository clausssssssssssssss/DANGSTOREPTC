import { Schema, model } from "mongoose";

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [/^[^\s].+[^\s]$/, "Nombre inválido"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Correo inválido"],
  },
  dui: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{8}-\d$/, "DUI inválido. Debe tener el formato 12345678-9"],
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

export default model("Client", clientSchema);
