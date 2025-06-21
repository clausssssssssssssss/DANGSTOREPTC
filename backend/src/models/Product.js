// models/Product.js
// Mongoose
import { Schema, model } from "mongoose";

// Schema
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    
    price: {
        type: Number,
        required: true,
        min: 0
    },
    
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    
    description: {
        type: String,
        required: false,
        maxLength: 1000
    },
    
    category: {
        type: String,
        required: true,
        trim: true
    },
    
    images: [{
        type: String,
        required: false
    }]
}, {
    timestamps: true,
    strict: false
});

// Export
export default model("Product", productSchema);