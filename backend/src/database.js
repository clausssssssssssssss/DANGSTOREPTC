import mongoose from "mongoose";
import dotenv from 'dotenv';
import { config } from './config.js'

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Configurar la URI o dirección de la base de datos
const URI = config.db.URI;

// Conexión a la base de datos en MongoDB
mongoose.connect(URI);

// En una constante guardo la conexión, que puede tener los valores (open, disconnected o error)
const connection = mongoose.connection;

// Evento para cuando se conecte la base de datos
connection.once("open", () => {
  console.log("Database is connected");
});

// Evento para detectar si se desconecta la base de datos
connection.on("disconnected", () => {
  console.log("Database is disconnected");
});

// Evento para detectar errores en la conexión
connection.on("error", (err) => {
  console.error("Database connection error:", err);
});
