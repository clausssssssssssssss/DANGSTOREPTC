// src/controllers/passwordRecoveryController.js
import bcrypt from "bcryptjs";
import Customer from "../models/Customers.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailService.js";

const passwordRecoveryController = {};

/**
 * POST /api/password-recovery/send-code
 * Genera y envía un código de 4 dígitos para recuperar contraseña.
 * El código expira en 15 minutos.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Mensaje de éxito o error.
 */
passwordRecoveryController.sendRecoveryCode = async (req, res) => {
  try {
    const { email } = req.body;
    // Validar email
    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    // Verificar existencia de customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // 1) Generar código aleatorio de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // 2) Guardar código y tiempo de expiración (15 minutos)
    customer.resetCode = {
      code,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    };
    await customer.save();

    // 3) Enviar email con código
    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña",
      text: `Tu código de recuperación es: ${code}. Válido 15 minutos.`,
      html: HTMLRecoveryEmail(code),
    });

    // Responder al cliente
    res.json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error("Error en sendCode:", error);
    res.status(500).json({ message: "Error interno al enviar código" });
  }
};

/**
 * POST /api/password-recovery/reset
 * Valida el código enviado y su expiración, luego actualiza la contraseña.
 * Limpia el campo resetCode tras el cambio.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Mensaje de éxito o error.
 */
passwordRecoveryController.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // Validar datos obligatorios
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Buscar customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // Verificar existencia de resetCode previo
    const { resetCode: rc = {} } = customer;
    if (!rc.code) {
      return res.status(400).json({ message: "No se solicitó restablecer contraseña" });
    }

    // Validar que el código coincida
    if (rc.code !== code) {
      return res.status(400).json({ message: "Código incorrecto" });
    }

    // Verificar que no haya expirado
    if (rc.expires < new Date()) {
      return res.status(400).json({ message: "Código expirado" });
    }

    // Encriptar y actualizar nueva contraseña
    customer.password = await bcrypt.hash(newPassword, 10);
    // Eliminar resetCode para evitar reutilización
    customer.resetCode = {};
    await customer.save();

    res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error interno al restablecer contraseña" });
  }
};

/**
 * POST /api/password-recovery/verify-code
 * Verifica que el código enviado por email sea válido y no esté expirado.
 *
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Confirmación de validez o error.
 */
passwordRecoveryController.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    // Validar datos obligatorios
    if (!email || !code) {
      return res.status(400).json({ message: "Email y código son obligatorios" });
    }

    // Buscar customer e identificar resetCode
    const customer = await Customer.findOne({ email });
    if (!customer || !customer.resetCode || customer.resetCode.code !== code) {
      return res.status(400).json({ message: "Código incorrecto" });
    }

    // Verificar expiración
    if (customer.resetCode.expires < new Date()) {
      return res.status(400).json({ message: "Código expirado" });
    }

    // Código válido
    res.json({ ok: true, message: "Código válido" });
  } catch (err) {
    console.error("Error en verifyCode:", err);
    res.status(500).json({ message: "Error interno validating code" });
  }
};

export default passwordRecoveryController;
