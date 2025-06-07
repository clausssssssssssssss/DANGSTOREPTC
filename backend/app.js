// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./database');                // tu database.js
const authRoutes = require('./src/routes/authRoutes');

const app = express();
connectDB();                                            // conectar a Mongo

app.use(cors({
  origin: 'http://localhost:3000',                     // tu frontend
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Prefijo /api/auth para tus rutas
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));
