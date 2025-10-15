import { sendEmail } from "../utils/mailService.js";
import { config } from "../../config.js"; 

const contactController = {};

contactController.sendContact = async (req, res) => {
  try {
    console.log('=== FORMULARIO DE CONTACTO ===');
    console.log(' Datos recibidos:', req.body);
    
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      console.log(' Faltan datos obligatorios');
      return res.status(400).json({ message: "Faltan datos obligatorios: name, email o message" });
    }

    const subject = `Nuevo mensaje de contacto de ${name}`;
    const html = `
      <h2>Mensaje de contacto recibido</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br>${message}</p>
    `;

    console.log(' Configuración de email:');
    console.log('  - Destinatario:', config.email.brevo.senderEmail);
    console.log('  - API Key configurada:', !!config.email.brevo.apiKey);
    console.log('  - Sender Name:', config.email.brevo.senderName);

    await sendEmail({
      to: config.email.brevo.senderEmail,
      subject,
      html,
    });

    console.log(' Email enviado exitosamente');
    res.json({ message: "Mensaje enviado correctamente, gracias por contactarnos." });
  } catch (error) {
    console.error(" ERROR EN FORMULARIO DE CONTACTO:", error.message);
    console.error("Stack completo:", error.stack);
    res.status(500).json({ message: "Error interno al enviar el mensaje" });
  }
};

export default contactController;
