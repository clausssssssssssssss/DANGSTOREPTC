// backend/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import customerRoutes         from './src/routes/customers.js';
import passwordRecoveryRoutes from './src/routes/passwordRecovery.js';
import cartRoutes             from './src/routes/cart.js';
import customOrderRoutes      from './src/routes/customOrder.js';
import contactRoutes          from './src/routes/contact.js';
import catalogRoutes          from './src/routes/catalogo.js';
import productRoutes          from './src/routes/products.js';
import materialRoutes         from './src/routes/material.js';
import profileRoutes          from './src/routes/profile.js';
import adminAuthRoutes        from './src/routes/adminAuth.js';
import logoutRoutes           from './src/routes/logout.js';
import paymentRoutes          from './src/routes/paymentRoutes.js';
import ratingsRoutes          from './src/routes/ratings.js';

import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

/**
 * Aplicación principal de Express.
 * Configura middlewares globales y monta los routers de la API.
 */
const app = express();
app.use(cors());


/** Habilita el parseo de JSON en el cuerpo de las solicitudes */
app.use(express.json());

/** Habilita el parseo de cookies en las solicitudes */
app.use(cookieParser());

//Traemos el archivo json
 const swaggerDocument = JSON.parse(
   fs.readFileSync(path.resolve("./DangStore.01.json"), "utf-8")
 );

/** Sirve archivos estáticos desde la carpeta "uploads" bajo la ruta /uploads */
app.use('/uploads', express.static('uploads'));

/**
 * Rutas de la API montadas en diferentes endpoints:
 */

 app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// CRUD de clientes
app.use('/api/customers', customerRoutes);

// Recuperación de contraseña (envío de token, validación, nuevo password)
app.use('/api/password-recovery', passwordRecoveryRoutes);

// Carrito de compras: agregar, ver, actualizar y eliminar ítems
app.use('/api/cart', cartRoutes);

// Órdenes estándar (creación, consulta, actualización de estado)

// Órdenes personalizadas (custom orders)
app.use('/api/custom-orders', customOrderRoutes);

// Formulario de contacto y gestión de mensajes
app.use('/api/contact', contactRoutes);

// Catálogo general (listado de categorías, filtros, etc.)
app.use('/api/catalog', catalogRoutes);

// Gestión de productos (CRUD, imágenes, stock)
app.use('/api/products', productRoutes);

// Gestión de materiales (inventario)
app.use('/api/material', materialRoutes);

// Perfil de usuario (lectura y actualización de datos del cliente autenticado)
app.use('/api/profile', profileRoutes);

// Autenticación y autorización de administradores
app.use('/api/admins', adminAuthRoutes);

// Cerrar sesión (limpiar cookies/token)
app.use('/api/logout', logoutRoutes);

// Procesamiento de pagos (Wompi y pagos simulados)
app.use('/api/payments', paymentRoutes);

// Sistema de reseñas y ratings de productos
app.use('/api/ratings', ratingsRoutes);

/**
 * Exporta la instancia de la aplicación Express
 * para que pueda ser utilizada por el servidor (e.g., server.js).
 */
export default app;
