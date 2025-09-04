import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';

import customerRoutes from './src/routes/customers.js';
import passwordRecoveryRoutes from './src/routes/passwordRecovery.js';
import cartRoutes from './src/routes/cart.js';
import customOrderRoutes from './src/routes/customOrder.js';
import contactRoutes from './src/routes/contact.js';
import catalogRoutes from './src/routes/catalogo.js';
import productRoutes from './src/routes/products.js';
import materialRoutes from './src/routes/material.js';
import profileRoutes from './src/routes/profile.js';
import adminAuthRoutes from './src/routes/adminAuth.js';
import logoutRoutes from './src/routes/logout.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import ratingsRoutes from './src/routes/ratings.js';
import notificationsRoutes from './src/routes/notifications.js';
import salesRoutes from './src/routes/sales.js';
import categoryRoutes from './src/routes/category.js';
import swaggerUi from "swagger-ui-express";
import fs from "fs";

/**
 * Aplicación principal de Express.
 * Configura middlewares globales y monta los routers de la API.
 */
const app = express();

// Configuración de CORS para permitir solicitudes desde la app móvil y frontend web
app.use(cors({
  origin: true, // Permitir todos los orígenes temporalmente
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/** Habilita el parseo de JSON en el cuerpo de las solicitudes */
app.use(express.json({ limit: '10mb' }));

/** Habilita el parseo de datos de formularios en las solicitudes */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/** Habilita el parseo de cookies en las solicitudes */
app.use(cookieParser());
// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

// Middleware para manejar errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande' });
    }
  }
  next(error);
});

// Traemos el archivo json de Swagger
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve("./DangStore.json"), "utf-8")
);

/** Sirve archivos estáticos desde la carpeta "uploads" bajo la ruta /uploads */
app.use('/uploads', express.static('uploads'));

/**
 * Rutas de la API montadas en diferentes endpoints:
 */

// Documentación de la API con Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// CRUD de clientes
app.use('/api/customers', customerRoutes);

// Recuperación de contraseña (envío de token, validación, nuevo password)
app.use('/api/password-recovery', passwordRecoveryRoutes);

// Carrito de compras: agregar, ver, actualizar y eliminar ítems
app.use('/api/cart', cartRoutes);

// Órdenes personalizadas (custom orders)
app.use('/api/custom-orders', customOrderRoutes);

// Formulario de contacto y gestión de mensajes
app.use('/api/contact', contactRoutes);

// Catálogo general (listado de categorías, filtros, etc.)
app.use('/api/catalog', catalogRoutes);

// Gestión de productos (CRUD, imágenes, stock) - IMPORTANTE: Esta ruta maneja la creación de productos
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

// Sistema de notificaciones
app.use('/api/notifications', notificationsRoutes);

// Sistema para reporte de ventas (diario, mensual, anual, por categoría, por rango de fechas)
app.use('/api/sales', salesRoutes);

app.use('/api/categories', categoryRoutes);

// Health check simple
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check solicitado');
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    uploadsDirectory: path.resolve('uploads'),
    routes: [
      '/api/custom-orders',
      '/api/custom-orders/pending',
      '/api/admins/login',
      '/api/notifications',
      '/api/notifications/unread-count',
      '/api/products' // Añadido para verificar la ruta de productos
    ],
    notifications: {
      available: true,
      endpoints: [
        'GET /api/notifications',
        'GET /api/notifications/unread-count',
        'PUT /api/notifications/:id/read',
        'PUT /api/notifications/read-all',
        'DELETE /api/notifications/:id',
        'DELETE /api/notifications'
      ]
    }
  });
});

// Ruta de prueba para subida de imágenes
app.post('/api/upload-test', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
  }
  
  res.json({
    message: 'Imagen subida correctamente',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Logging de todas las rutas registradas
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path}`);
  next();
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este servidor` 
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error(' Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo es demasiado grande' });
  }
  
  if (error.message === 'Solo se permiten imágenes') {
    return res.status(400).json({ error: 'Solo se permiten archivos de imagen' });
  }app.use(cors({
  origin: ['http://localhost:3000', 'exp://your-ip:19000', 'http://your-ip:19000'],
  credentials: true
}));
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

/**
 * Exporta la instancia de la aplicación Express
 * para que pueda ser utilizada por el servidor (e.g., server.js).
 */
export default app;