// src/models/customizedOrders.js
import { Schema, model, Types } from 'mongoose';

const customizedOrderSchema = new Schema({
  user:      { type: Types.ObjectId, ref: 'Customer', required: true },
  imageUrl:  { type: String, required: true },
  modelType: { type: String, enum: ['cuadro_chico','llavero', 'cuadro_grande'], required: true },
  description: { type: String },  
  status:    { type: String, enum: ['pending','quoted','accepted','rejected'], default: 'pending' },
  price:     { type: Number },
  comment:   { type: String }
}, { timestamps: true });

export default model('CustomizedOrder', customizedOrderSchema);
