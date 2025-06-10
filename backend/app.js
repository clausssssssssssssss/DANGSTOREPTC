// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/products.js';
import customersRoutes from './src/routes/customers.js';


const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:4000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Prefijo de tus rutas de auth
app.use('/api/auth', authRoutes);
app.use('/api/Product', productRoutes)
app.use('/api/Customers', customersRoutes)

export default app;
