// src/controllers/passwordRecoveryController.js
import Customer from "../models/Customers.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/passwordRecoveryMail.js";

export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    // 1) Buscar customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email no registrado" });
    }

    // 2) Generar código de 4 dígitos
const code = Math.floor(1000 + Math.random() * 9000).toString();
    // Aquí podrías guardar el code + expiration en la BD, si quieres validar luego.

    // 3) Enviar mail
    const textBody = `Tu código de recuperación es: ${code}.\n\nVálido por 15 minutos.`;
    const htmlBody = HTMLRecoveryEmail(code);

    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña",
      text: textBody,
      html: htmlBody,
    });

    console.log(`📧 Código ${code} enviado a ${email}`);
    return res.json({ message: "Código enviado al correo" });

  } catch (error) {
    console.error("Error en sendCode:", error);
    return res.status(500).json({ message: "Error interno al enviar código" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    return res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({ message: "Error interno al restablecer contraseña" });
  }
};
