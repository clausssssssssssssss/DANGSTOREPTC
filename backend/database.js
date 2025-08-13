import mongoose from "mongoose";
import { config } from "./config.js";

const uri = config.db.URI;

if (!uri) {
  console.warn("[DB] MONGO_URI no definido. Saltando conexión a MongoDB. (El login admin funcionará igualmente)");
} else {
  mongoose
    .connect(uri)
    .then(() => console.log("DB is connected"))
    .catch((err) => console.error("[DB] Error de conexión:", err?.message || err));

  const connection = mongoose.connection;
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
  });
  connection.on("disconnected", () => {
    console.log("DB is disconnected");
  });
  connection.on("error", (error) => {
    console.log("error found" + error);
  });
}