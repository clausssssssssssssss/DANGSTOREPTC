// src/utils/passwordRecoveryMail.js
import nodemailer from 'nodemailer';
import { config } from '../config.js';

/**
 * Transporter de Nodemailer configurado para Gmail SMTP.
 * Utiliza credenciales definidas en el archivo de configuración.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: config.email.user, // Usuario SMTP (correo)
    pass: config.email.pass, // Contraseña o App Password
  },
});

/**
 * Envía un correo electrónico utilizando el transporter configurado.
 *
 * @async
 * @function sendEmail
 * @param {Object} options - Opciones del correo.
 * @param {string} options.to - Destinatario(s) del correo.
 * @param {string} options.subject - Asunto del correo.
 * @param {string} [options.text] - Cuerpo del correo en texto plano.
 * @param {string} [options.html] - Cuerpo del correo en HTML.
 * @throws Lanzará un error si el envío falla.
 * @returns {Promise<Object>} Resultado de transporter.sendMail
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    return await transporter.sendMail({
      from: `"Soporte DANGSTORE" <${config.email.email}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error('Error enviando correo:', err);
    throw err;
  }
};

/**
 * Genera el contenido HTML para el correo de recuperación de contraseña.
 *
 * @function HTMLRecoveryEmail
 * @param {string} code - Código de recuperación de 4 dígitos.
 * @returns {string} Cadena HTML para el correo.
 */
const HTMLRecoveryEmail = (code) => `
  <div style="font-family: Arial; text-align: center;">
    <h2>¡Hola querido usuario! Tu código de recuperación es:</h2>
    <p style="font-size: 2rem; font-weight: bold;">${code}</p>
    <p>Válido por 15 minutos.</p>
  </div>
`;

export { sendEmail, HTMLRecoveryEmail };
