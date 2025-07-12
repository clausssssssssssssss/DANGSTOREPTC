import { sendEmail } from "../utils/mailService.js";

const contactController = {};

// Esta función recibe datos del contacto y envía un email
contactController.sendContact = async (req, res) => {
  try {
    // Tomo los datos que manda el usuario por body
    const { name, email, message } = req.body;

    // Si falta alguno, corto y aviso que faltan datos
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Faltan datos obligatorios: name, email o message" });
    }

    // Armo el asunto del mail con el nombre que me mandaron
    const subject = `Nuevo mensaje de contacto de ${name}`;

    // Aquí creo el contenido del mail en HTML, con los datos que recibí
    const html = `
      <h2>Mensaje de contacto recibido</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br>${message}</p>
    `;

    // Mando el mail usando la función importada, destino es email de soporte en config/env
    await sendEmail({
      to: process.env.SUPPORT_EMAIL || config.email.user,
      subject,
      html,
    });

    // Si todo va bien, respondo que el mensaje se envió ok
    res.json({ message: "Mensaje enviado correctamente, gracias por contactarnos." });
  } catch (error) {
    // Si falla algo, muestro error en consola y aviso error al cliente
    console.error("Error en sendContact:", error);
    res.status(500).json({ message: "Error interno al enviar el mensaje" });
  }
};

export default contactController;
