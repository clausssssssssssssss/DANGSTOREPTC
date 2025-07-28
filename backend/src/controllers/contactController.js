import { sendEmail } from "../utils/mailService.js";
import { config } from "../../config.js"; // ✅ importar config

const contactController = {};

contactController.sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Faltan datos obligatorios: name, email o message" });
    }

    const subject = `Nuevo mensaje de contacto de ${name}`;
    const html = `
      <h2>Mensaje de contacto recibido</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br>${message}</p>
    `;

    console.log('Enviando correo a:', config.email.user); // ✅

    await sendEmail({
      to: config.email.user,
      subject,
      html,
    });

    res.json({ message: "Mensaje enviado correctamente, gracias por contactarnos." });
  } catch (error) {
    console.error("ERROR COMPLETO:", error);
    res.status(500).json({ message: "Error interno al enviar el mensaje" });
  }
};

export default contactController;
