// loginController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from "../config.js";

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: "Email no registrado" });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const payload = { userId: customer._id, userType: "customer" };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

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
    return res.status(500).json({
      message: "Error interno del servidor",
      detail:  error.message
    });
  }
};
