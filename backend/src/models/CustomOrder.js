// models/CustomOrder.js - VERSIÓN MEJORADA

import { Schema, model, Types } from 'mongoose';

const customizedOrderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    modelType: {
      type: String,
      // QUITAR el enum para permitir valores dinámicos de las categorías
      required: true,
      validate: {
        validator: async function(value) {
          // Validación personalizada: verificar que el modelType existe en las categorías
          const Category = model('Category'); // Asumiendo que tienes un modelo Category
          const category = await Category.findOne({ 
            $or: [
              { name: value },
              { name: { $regex: new RegExp(`^${value}$`, 'i') } } // case insensitive
            ]
          });
          return !!category;
        },
        message: 'El tipo de modelo debe corresponder a una categoría válida'
      }
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'accepted', 'rejected'],
      default: 'pending',
    },
    price: {
      type: Number,
    },
    comment: {
      type: String,
    },
    decision: {
      type: String,
      enum: ['accept', 'reject'],
    },
    decisionDate: {
      type: Date,
    },
    // Campos para rechazo del admin
    rejectionReason: {
      type: String,
    },
    rejectionDate: {
      type: Date,
    },
    // Referencia al producto creado en el catálogo cuando el encargo es aceptado
    catalogProductId: {
      type: Types.ObjectId,
      ref: 'Product',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default model('CustomizedOrder', customizedOrderSchema);