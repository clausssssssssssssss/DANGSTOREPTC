// backend/src/config.js

import dotenv from "dotenv";
dotenv.config();

/**
 * Configuración central de la aplicación.
 * Carga las variables de entorno y expone los ajustes para los diferentes módulos.
 */
export const config = {
  // Configuración de la base de datos: URI de conexión a MongoDB
  db: {
    URI: process.env.MONGO_URI,
  },

  // Configuración del servidor: puerto de escucha
  server: {
    port: process.env.PORT,
  },

  // Configuración de JWT: clave secreta y tiempo de expiración
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  // Credenciales por defecto del administrador: email y contraseña
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  // Configuración de correo: usuario y contraseña SMTP
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

};
