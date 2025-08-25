// backend/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

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
const server = createServer(app); // Crear servidor HTTP para Socket.io

// Inicializar Socket.io

app.use(cors());

/** Habilita el parseo de JSON en el cuerpo de las solicitudes */
app.use(express.json({ limit: '50mb' }));

/** Habilita el parseo de datos de formularios */
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/** Habilita el parseo de cookies en las solicitudes */
app.use(cookieParser());

//Traemos el archivo json
 const swaggerDocument = JSON.parse(
   fs.readFileSync(path.resolve("./DangStore.json"), "utf-8")
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

// Sistema de notificaciones en tiempo real

// Ruta de salud para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor DangStore funcionando correctamente', 
    timestamp: new Date(),
    services: {
      notifications: true,
      websocket: true,
      database: 'MongoDB'
    }
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

/**
 * Exporta la instancia del servidor HTTP
 * para que pueda ser utilizada por el punto de entrada (e.g., server.js).
 */
export { app, server };