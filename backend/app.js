// backend/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import customerRoutes         from './src/routes/customers.js';
import passwordRecoveryRoutes from './src/routes/passwordRecovery.js';
import cartRoutes             from './src/routes/cart.js';
import orderRoutes            from './src/routes/order.js';
import customOrderRoutes      from './src/routes/customOrder.js';
import contactRoutes          from './src/routes/contact.js';
import catalogRoutes          from './src/routes/catalogo.js';
import productRoutes          from './src/routes/products.js';
import profileRoutes          from './src/routes/profile.js';
import adminAuthRoutes        from './src/routes/adminAuth.js';
import logoutRoutes           from './src/routes/logout.js';

/**
 * Aplicación principal de Express.
 * Configura middlewares globales y monta los routers de la API.
 */
const app = express();

/** Habilita CORS para permitir peticiones desde el frontend en http://localhost:5173 */
app.use(cors({ origin: 'http://localhost:5173' }));

/** Habilita el parseo de JSON en el cuerpo de las solicitudes */
app.use(express.json());

/** Habilita el parseo de cookies en las solicitudes */
app.use(cookieParser());

/** Sirve archivos estáticos desde la carpeta "uploads" bajo la ruta /uploads */
app.use('/uploads', express.static('uploads'));

/**
 * Rutas de la API montadas en diferentes endpoints:
 */

// CRUD de clientes
app.use('/api/customers', customerRoutes);

// Recuperación de contraseña (envío de token, validación, nuevo password)
app.use('/api/password-recovery', passwordRecoveryRoutes);

// Carrito de compras: agregar, ver, actualizar y eliminar ítems
app.use('/api/cart', cartRoutes);

// Órdenes estándar (creación, consulta, actualización de estado)
app.use('/api/orders', orderRoutes);

// Órdenes personalizadas (custom orders)
app.use('/api/custom-orders', customOrderRoutes);

// Formulario de contacto y gestión de mensajes
app.use('/api/contact', contactRoutes);

// Catálogo general (listado de categorías, filtros, etc.)
app.use('/api/catalog', catalogRoutes);

// Gestión de productos (CRUD, imágenes, stock)
app.use('/api/products', productRoutes);

// Perfil de usuario (lectura y actualización de datos del cliente autenticado)
app.use('/api/profile', profileRoutes);

// Autenticación y autorización de administradores
app.use('/api/admins', adminAuthRoutes);

// Cerrar sesión (limpiar cookies/token)
app.use('/api/logout', logoutRoutes);

/**
 * Exporta la instancia de la aplicación Express
 * para que pueda ser utilizada por el servidor (e.g., server.js).
 */
export default app;
