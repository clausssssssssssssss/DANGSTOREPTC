// src/controllers/passwordRecoveryController.js
import bcrypt from "bcryptjs";
import Customer from "../models/Customers.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailService.js";

const passwordRecoveryController = {};

/**
 * POST /api/password-recovery/send-code
 * Genera y envía un código de 4 dígitos, lo guarda con expiración de 15 min.
 */
passwordRecoveryController.sendRecoveryCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // 1) Generar código de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // 2) Guardar código + expiry (15 minutos)
    customer.resetCode = {
      code,
      expires: new Date(Date.now() + 15 * 60 * 1000)
    };
    await customer.save();

    // 3) Enviar email
    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña",
      text: `Tu código de recuperación es: ${code}. Válido 15 minutos.`,
      html: HTMLRecoveryEmail(code)
    });

    return res.json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error("Error en sendCode:", error);
    return res.status(500).json({ message: "Error interno al enviar código" });
  }
};

/**
 * POST /api/password-recovery/reset
 * Valida código + expiración y actualiza la contraseña.
 */
passwordRecoveryController.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // Verificar que exista un resetCode
    const rc = customer.resetCode || {};
    if (!rc.code) {
      return res.status(400).json({ message: "No se solicitó restablecer contraseña" });
    }

    // Comparar código
    if (rc.code !== code) {
      return res.status(400).json({ message: "Código incorrecto" });
    }

    // Comparar expiración
    if (rc.expires < new Date()) {
      return res.status(400).json({ message: "Código expirado" });
    }

    // Hash de la nueva contraseña
    customer.password = await bcrypt.hash(newPassword, 10);

    // Limpiar resetCode para que no se reutilice
    customer.resetCode = {};
    await customer.save();

    return res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({ message: "Error interno al restablecer contraseña" });
  }
};

passwordRecoveryController.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email y código son obligatorios" });
    }
    const customer = await Customer.findOne({ email });
    if (!customer || !customer.resetCode || customer.resetCode.code !== code) {
      return res.status(400).json({ message: "Código incorrecto" });
    }
    if (customer.resetCode.expires < new Date()) {
      return res.status(400).json({ message: "Código expirado" });
    }
    // todo OK
    return res.json({ ok: true, message: "Código válido" });
  } catch (err) {
    console.error("Error en verifyCode:", err);
    return res.status(500).json({ message: "Error interno validating code" });
  }
};


export default passwordRecoveryController;
