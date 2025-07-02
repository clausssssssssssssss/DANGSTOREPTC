// backend/src/controllers/customerController.js
import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/passwordRecoveryMail.js";

/**
 * Controlador para el registro de un nuevo customer.
 * Verifica datos obligatorios, encripta contraseña, crea el registro,
 * genera un token JWT y envía un email de bienvenida.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Respuesta con estado y datos del usuario o error.
 */
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, telephone } = req.body;
    // Validar campos obligatorios
    if (!name || !email || !password || !telephone) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar si el email ya está registrado
    if (await Customer.findOne({ email })) {
      return res.status(409).json({ message: "Email ya registrado" });
    }

    // Encriptar la contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Crear el nuevo customer en la base de datos
    const newCustomer = await Customer.create({
      name,
      email,
      password: hashed,
      telephone,
    });

    // Generar payload y firmar token JWT
    const payload = { userId: newCustomer._id, userType: "customer" };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Enviar email de bienvenida
    await sendEmail({
      to: newCustomer.email,
      subject: "¡Bienvenido a DANGSTORE!",
      html: `
        <h1>Hola ${newCustomer.name} 👋</h1>
        <p>Gracias por registrarte en DANGSTORE. Ya puedes disfrutar de nuestros productos.</p>
      `,
    });

    // Respuesta exitosa con token y datos del usuario (sin contraseña)
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
    // Manejo de error en caso de duplicidad de clave única
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email ya registrado" });
    }
    console.error("Error en registerCustomer:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Controlador para obtener todos los customers.
 * Excluye campos sensibles como contraseña y versión.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Lista de customers o error.
 */
export const getAllCustomers = async (req, res) => {
  try {
    // Obtener todos los documentos de Customer sin contraseña ni __v
    const customers = await Customer.find().select("-password -__v");
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
};

/**
 * Controlador para obtener un customer por su ID.
 * Retorna 404 si no existe.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Datos del customer o error.
 */
export const getCustomerById = async (req, res) => {
  try {
    // Buscar por ID y excluir campos sensibles
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

/**
 * Controlador para eliminar un customer por su ID.
 * Retorna 404 si no se encuentra y mensaje de confirmación si se elimina.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Mensaje de éxito o error.
 */
export const deleteCustomer = async (req, res) => {
  try {
    // Eliminar documento por ID
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
