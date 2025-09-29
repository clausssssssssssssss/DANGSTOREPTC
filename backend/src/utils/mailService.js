// src/utils/mailService.js
// Este es el archivo PRINCIPAL que usa tu controlador

import { config } from '../../config.js';

/**
 * Servicio de email usando Brevo API
 * Este es el archivo que importa tu passwordRecoveryController
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('📧 Enviando correo con Brevo a:', to);

    // Validar que tenemos la API key
    if (!config.email.brevo.apiKey) {
      throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.email.brevo.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: config.email.brevo.senderName, 
          email: config.email.brevo.senderEmail 
        },
        to: [{ email: to, name: "Usuario DANGSTORE" }],
        subject: subject,
        htmlContent: html || `<p>${text}</p>`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Brevo API:', errorData);
      throw new Error(`Error enviando email: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Email enviado exitosamente con Brevo:', data);
    return data;

  } catch (err) {
    console.error('❌ Error en sendEmail con Brevo:', err);
    throw err;
  }
};

/**
 * Genera el contenido HTML para el mensaje de recuperación de contraseña.
 * Versión optimizada para códigos de 4 dígitos
 */
const HTMLRecoveryEmail = (code) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Recuperación - DANGSTORE</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
      
      <!-- Header con gradiente -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
          🛍️ DANGSTORE
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
          Recuperación de Contraseña
        </p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <div style="text-align: center;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
            ¡Hola querido usuario! 👋
          </h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.<br>
            Tu código de verificación es:
          </p>
          
          <!-- Código destacado -->
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 12px; margin: 30px 0; box-shadow: 0 8px 25px rgba(238, 90, 36, 0.3);">
            <p style="font-size: 48px; font-weight: 900; color: white; margin: 0; letter-spacing: 8px; text-shadow: 0 3px 6px rgba(0,0,0,0.3); font-family: 'Courier New', monospace;">
              ${code}
            </p>
          </div>
          
          <!-- Instrucciones -->
          <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: white; font-size: 14px; margin: 0; font-weight: 600;">
              💡 Ingresa este código en la aplicación para continuar
            </p>
          </div>
          
          <!-- Warning -->
          <div style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: white; font-size: 14px; font-weight: bold; margin: 0;">
              ⏰ Este código expira en 15 minutos
            </p>
          </div>
          
          <p style="color: #888; font-size: 13px; margin-top: 30px; line-height: 1.4;">
            Si no solicitaste este código, puedes ignorar este mensaje de forma segura.<br>
            Tu cuenta permanecerá protegida. 🔒
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 12px; margin: 0; line-height: 1.4;">
          © 2024 <strong>DANGSTORE</strong>. Todos los derechos reservados.<br>
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
      
    </div>
  </body>
  </html>
`;

/**
 * Función de prueba para verificar que el servicio de email funciona
 */
export const testEmailService = async (testEmail) => {
  try {
    console.log('🧪 Probando servicio de email...');
    
    const result = await sendEmail({
      to: testEmail,
      subject: 'Prueba de servicio de email - DANGSTORE',
      html: `
        <div style="font-family: Arial; text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
          <h2>✅ ¡Servicio de email funcionando!</h2>
          <p>Tu configuración de Brevo está trabajando correctamente.</p>
          <p style="font-size: 12px; opacity: 0.8;">Prueba realizada: ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    console.log('✅ Prueba de email exitosa:', result);
    return result;
  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
    throw error;
  }
};

// Exportamos las funciones que usa el controlador
export {
  sendEmail,
  HTMLRecoveryEmail
};