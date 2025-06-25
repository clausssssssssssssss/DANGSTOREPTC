import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
     user: config.email.user, 
    pass: config.email.pass
  },
});

// Función para enviar correos
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

// Función que genera el HTML del correo de recuperación
const HTMLRecoveryEmail = (code) => `
  <div style="font-family: Arial; text-align: center;">
    <h2>Tu código de recuperación es:</h2>
    <p style="font-size: 2rem; font-weight: bold;">${code}</p>
    <p>Válido por 15 minutos.</p>
  </div>
`;

export { sendEmail, HTMLRecoveryEmail };
