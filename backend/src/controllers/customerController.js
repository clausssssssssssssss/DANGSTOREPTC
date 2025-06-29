import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/mailService.js";

const customerController = {};

// Registrar cliente
customerController.registerCustomer = async (req, res) => {
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
      name,
      email,
      password: hashed,
      telephone,
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
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
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

// Obtener todos los clientes
customerController.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select("-password -__v");
    res.json(customers);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// Obtener cliente por ID
customerController.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password -__v");
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ message: "Error al obtener cliente" });
  }
};

// Eliminar cliente
customerController.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};

// Obtener perfil del cliente autenticado
customerController.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password -__v");
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener el perfil del cliente" });
  }
};

export default customerController;
