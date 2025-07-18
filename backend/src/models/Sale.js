import { Schema, model } from "mongoose";

const saleSchema = new Schema(
  {
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
      }
    ],

    customer: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

export default model("Sale", saleSchema);
