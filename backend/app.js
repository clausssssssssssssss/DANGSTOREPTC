// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoutes.js';

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

export default app;
