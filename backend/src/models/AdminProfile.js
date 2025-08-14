import { Schema, model } from 'mongoose';

// Perfil editable del administrador (no usado para login)
const adminProfileSchema = new Schema(
  {
    email: { type: String, required: true, unique: true }, // email del admin (del token)
    name: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    profileImage: { type: String, default: '' }, // puede ser URL o data URI
  },
  { timestamps: true }
);

export default model('AdminProfile', adminProfileSchema);


