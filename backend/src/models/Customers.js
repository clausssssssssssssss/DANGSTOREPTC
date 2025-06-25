// src/models/Customers.js
import { Schema, model } from "mongoose";

const customerSchema = new Schema({
  name:      { type: String, required: true, trim: true, maxLength: 200 },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minLength: 6 },
  telephone: { type: String, required: true, unique: true, trim: true },
  isVerified:{ type: Boolean, default: false },

  resetCode: {
    code:   { type: String },
    expires:{ type: Date }
  }
}, { timestamps: true });

export default model("Customer", customerSchema);
