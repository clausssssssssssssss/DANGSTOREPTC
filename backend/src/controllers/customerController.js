// backend/src/controllers/customerController.js
import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/passwordRecoveryMail.js";

// Registro de customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, telephone } = req.body;
    if (!name || !email || !password || !telephone) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (await Customer.findOne({ email })) {
      return res.status(409).json({ message: "Email ya registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newCustomer = await Customer.create({
      name, email, password: hashed, telephone
    });

    const payload = { userId: newCustomer._id, userType: "customer" };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    await sendEmail({
      to: newCustomer.email,
      subject: "¡Bienvenido a DANGSTORE!",
      html: `
        <h1>Hola ${newCustomer.name} 👋</h1>
        <p>Gracias por registrarte en DANGSTORE. Ya puedes disfrutar de nuestros productos.</p>
      `,
    });

    res.status(201).json({
      message: "Customer registrado correctamente",
      token,
      user: {
        id:        newCustomer._id,
        name:      newCustomer.name,
        email:     newCustomer.email,
        telephone: newCustomer.telephone,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email ya registrado" });
    }
    console.error("Error en registerCustomer:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select("-password -__v");
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
};

// Obtener customer por ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer
      .findById(req.params.id)
      .select("-password -__v");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer" });
  }
};

// Eliminar customer
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer" });
  }
};
