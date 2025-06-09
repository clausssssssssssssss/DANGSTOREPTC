// database.js
import mongoose from 'mongoose';
import { config } from './src/config.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.db.uri);
    console.log(' MongoDB conectado');
  } catch (err) {
    console.error(' Error al conectar MongoDB:', err);
    process.exit(1);
  }
}
