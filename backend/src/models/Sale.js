import { Schema, model } from "mongoose";

//  Este es el esquema que define cómo se guarda una venta en la base de datos
const saleSchema = new Schema(
  {
    //  El producto que se vendió (puede ser nulo si fue personalizado)
    product: {
      type: Schema.Types.ObjectId, // Es una referencia a otro documento (un producto)
      ref: "Product",              // Nombre del modelo que se relaciona
      required: false,             // No es obligatorio (por si es un producto personalizado)
    },

    //  La categoría del producto (por ejemplo: "bebidas", "postres", etc.)
    category: {
      type: String,
      default: "Sin categoría",    // Si no se manda, se pone este valor por defecto
    },

    //  Cliente que hizo la compra (relación con el modelo Customer)
    customer: {
      type: Schema.Types.ObjectId, // Relacionado con el cliente
      ref: "Customer",
      required: true,              // Siempre se debe indicar el cliente
    },

    //  Total de dinero pagado por esta venta
    total: {
      type: Number,
      required: true,             // Es obligatorio
    },

    // Fecha en que se hizo la venta (se pone la fecha actual por defecto)
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    //  Agrega automáticamente los campos createdAt y updatedAt
    timestamps: true,

    //  Permite guardar campos adicionales aunque no estén definidos aquí
    strict: false,
  }
);

// Creamos y exportamos el modelo "Sale" para usarlo en otros archivos
export default model("Sale", saleSchema);
