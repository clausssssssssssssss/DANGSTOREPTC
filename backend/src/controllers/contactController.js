import { sendEmail } from "../utils/mailService.js";

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

    await sendEmail({
      to: process.env.SUPPORT_EMAIL || config.email.user, // env o el user de config
      subject,
      html,
    });

    res.json({ message: "Mensaje enviado correctamente, gracias por contactarnos." });
  } catch (error) {
    console.error("Error en sendContact:", error);
    res.status(500).json({ message: "Error interno al enviar el mensaje" });
  }
};

export default contactController;
