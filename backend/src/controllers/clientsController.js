import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Client from "../models/client.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/passwordRecoveryMail.js";

// REGISTRO DE CLIENTE
export const registerClient = async (req, res) => {
  try {
    const { name, email, dui, password } = req.body;

    // 1. Validación de campos
    if (!name || !email || !dui || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // 2. Verificar si ya existe email o DUI
    const existsEmail = await Client.findOne({ email });
    if (existsEmail) {
      return res.status(409).json({ message: "Email ya registrado" });
    }
    const existsDui = await Client.findOne({ dui });
    if (existsDui) {
      return res.status(409).json({ message: "DUI ya registrado" });
    }

    // 3. Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear cliente
    const newClient = new Client({
      name,
      email,
      dui,
      password: hashedPassword,
    });
    await newClient.save();

    // 5. Generar token JWT
    const payload = { userId: newClient._id, userType: "client" };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });

    // 6. Enviar correo de bienvenida
    await sendEmail({
      to: newClient.email,
      subject: "¡Bienvenido a Dangstore!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>¡Hola ${newClient.name}!</h1>
          <p>Gracias por registrarte en <strong>Dangstore </strong>.</p>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <hr/>
        </div>
      `,
    });

    // 7. Responder al cliente
    res.status(201).json({
      message: "Cliente registrado correctamente",
      token,
      user: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        dui: newClient.dui,
      },
    });
  } catch (error) {
    console.error("Error en registerClient:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// OBTENER TODOS LOS CLIENTES
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().select("-password");
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// OBTENER CLIENTE POR ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select("-password");
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(client);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ELIMINAR CLIENTE
export const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
