// backend/src/database.js
import mongoose from "mongoose";
import { config } from "./config.js";

export default async function connectDB() {
  const uri = config.db.URI;              // ← AHORA sí coincide
  console.log("Connect URI:", uri);       // debe imprimir tu cadena
  try {
    await mongoose.connect(uri, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log("✅ Database is connected");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}
