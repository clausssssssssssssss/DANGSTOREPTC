// src/controllers/loginController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from '../../config.js';

/**
 * Controlador para el login de un cliente.
 * Verifica credenciales, compara contraseña, genera token JWT y devuelve datos de usuario.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Respuesta con estado, token y datos de usuario o error.
 */
export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('→ Login attempt:', email, '/', password);

    // Buscar cliente por email e incluir campo password
    const customer = await Customer.findOne({ email }).select('+password');
    console.log('→ Found user, hashed password:', customer?.password);

    // Si no existe el cliente
    if (!customer) {
      return res.status(401).json({ message: "Email no registrado" });
    }

    // Comparar contraseña en texto plano con la hash almacenada
    const valid = await bcrypt.compare(password, customer.password);
    console.log('→ bcrypt.compare:', valid);

    // Si la contraseña no coincide
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear payload para JWT
    const payload = { userId: customer._id, userType: "customer" };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Responder con token y datos del usuario (sin contraseña)
    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id:        customer._id,
        name:      customer.name,
        email:     customer.email,
        telephone: customer.telephone,
      },
    });
  } catch (error) {
    console.error("Error en loginClient:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
