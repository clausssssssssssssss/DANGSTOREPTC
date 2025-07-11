// src/controllers/loginController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from '../../config.js';

/**
 * Controlador para el login de un cliente.
 * Normaliza email, incluye contraseña con select('+password'), compara hash
 * y firma un JWT con userType para distinguir customer/admin.
 */
export const loginClient = async (req, res) => {
  try {
    // 1) Normalizar entrada
    const email    = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    console.log('→ Login attempt:', email);

    // 2) Buscar cliente por email e INCLUIR el campo password
    const customer = await Customer
      .findOne({ email })
      .select('+password');  // <— fuerza traer el campo password aunque en el schema esté select:false

    console.log('→ Found user, hashed password:', customer?.password);

    // 3) Si no existe el cliente
    if (!customer) {
      return res.status(401).json({ message: "Email no registrado" });
    }

    // 4) Comparar contraseña en texto plano con el hash almacenado
    const valid = await bcrypt.compare(password, customer.password);
    console.log('→ bcrypt.compare:', valid);

    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 5) Crear y firmar el JWT
    const payload = {
      userId:   customer._id,
      userType: "customer"
    };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });

    // 6) Responder con token y datos (sin password)
    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id:        customer._id,
        name:      customer.name,
        email:     customer.email,
        telephone: customer.telephone
      },
    });

  } catch (error) {
    console.error("Error en loginClient:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
