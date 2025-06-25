// src/controllers/loginController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from "../config.js";

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('→ Login attempt:', email, '/', password);

    const customer = await Customer.findOne({ email }).select('+password');
    console.log('→ Found user, hashed password:', customer?.password);

    if (!customer) {
      return res.status(401).json({ message: "Email no registrado" });
    }

    const valid = await bcrypt.compare(password, customer.password);
    console.log('→ bcrypt.compare:', valid);

    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }


    const payload = { userId: customer._id, userType: "customer" };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id:        customer._id,
        name:      customer.name,
        email:     customer.email,
        telephone: customer.telephone
      }
    });
  } catch (error) {
    console.error("Error en loginClient:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
