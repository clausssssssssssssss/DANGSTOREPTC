import { Schema, model } from "mongoose";

// Esquema para órdenes de compra
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        quantity: {
          type: Number,
          required: true
        },

        price: {
          type: Number,
          required: true
        }
      }
    ],

    total: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "PENDING"
    },

    paypal: {
      orderID: {
        type: String,
        required: true
      },

      captureStatus: {
        type: String
      }
    }
  },
  {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
  }
);

export default model("Order", orderSchema);
