// src/models/Cart.js
import { Schema, model, Types } from 'mongoose';

const cartItemSchema = new Schema({
  product: { 
    type: Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  }
}, { _id: false });

const cartSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

export default model('Cart', cartSchema);
