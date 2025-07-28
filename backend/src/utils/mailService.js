// src/utils/passwordRecoveryMail.js

import nodemailer from 'nodemailer';
import { config } from '../../config.js';

/**
 * Configura el transporter de Nodemailer para Gmail SMTP.
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
 * Envía un correo electrónico con las opciones proporcionadas.
 * Utiliza el transporter configurado anteriormente.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    return await transporter.sendMail({
      from: `"Soporte DANGSTORE" <${config.email.user}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
console.log('Enviando correo a:', config.email.user);
    throw err;
  }
};

/**
 * Genera el contenido HTML para el mensaje de recuperación de contraseña.
 */
const HTMLRecoveryEmail = (code) => `
  <div style="font-family: Arial; text-align: center;">
    <h2>¡Hola querido usuario! Tu código de recuperación es:</h2>
    <p style="font-size: 2rem; font-weight: bold;">${code}</p>
    <p>Válido por 15 minutos.</p>
  </div>
`;

/**
 * Error HTTP 404 - Recurso no encontrado.
 */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404; // Código de estado HTTP
  }
}

/**
 * Error HTTP 400 - Solicitud incorrecta.
 */
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400; // Código de estado HTTP
  }
}

export {
  sendEmail,
  HTMLRecoveryEmail,
  NotFoundError,
  BadRequestError
};
