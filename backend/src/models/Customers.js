// models/Customer.js
// Mongoose
import { Schema, model } from "mongoose";

// Schema
const customerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    
    dui: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    
    isVerified: {
        type: Boolean,
        required: false,
        default: false
    }
}, {
    timestamps: true,
    strict: false
});

// Export
export default model("Customer", customerSchema);