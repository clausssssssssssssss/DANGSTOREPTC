import mongoose from "mongoose";
import { config } from "./config.js";

export default async function connectDB() {
  const uri = config.db.URI;
  console.log("Connect URI:", uri);
  
  try {
    await mongoose.connect(uri);
    console.log("✅ Database is connected");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

mongoose.connection.on('connected', () => {
  console.log(' Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(' MongoDB connection closed due to app termination');
  process.exit(0);
});