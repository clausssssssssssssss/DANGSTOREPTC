import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  user:    { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  items:   [{
    product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price:    { type: Number, required: true }
  }],
  total:   { type: Number, required: true },
  status:  { type: String, enum: ["PENDING","COMPLETED","CANCELLED"], default: "PENDING" },
  paypal: {
    orderID: { type: String, required: true },
    captureStatus: String
  }
}, { timestamps: true });

export default model("Order", orderSchema);
