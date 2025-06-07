// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Ruta POST /api/auth/register
router.post('/register', registerUser);

// Ruta POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;
