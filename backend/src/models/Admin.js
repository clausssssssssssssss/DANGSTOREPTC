// src/models/Admin.js
import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export default model("Admin", adminSchema);
